import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { permissions as webrtcPermissions } from '@stream-io/react-native-webrtc';

import {
  CallContent,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-native-sdk';

import { Text } from '../../components/ui/Text';
import { StreamBootstrapResponse, streamService } from '../../services/stream.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';

import { LiveTopBar } from './components/LiveTopBar';

const normalizeParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
const normalizeMode = (value?: string) => (value === 'host' ? 'host' : 'participant');

type StreamClientType = InstanceType<typeof StreamVideoClient>;
type StreamCallType = ReturnType<StreamClientType['call']>;

const RETRY_DELAY_MS = 8000;

const getParticipantCountFromCall = (call: StreamCallType) => {
  const anyState = call.state as any;
  const count = anyState?.participantCount ?? anyState?.participantsCount;
  if (typeof count === 'number') return count;
  const participantsMap: Record<string, unknown> | undefined =
    anyState?.participants ?? anyState?.participantsBySessionId ?? anyState?.participantsById;
  return participantsMap ? Object.keys(participantsMap).length : 0;
};

/**
 * ✅ IMPORTANT:
 * StreamVideoClient expects Stream's "User/UserRequest" shape (at least { id }),
 * not the SDK's StreamUser type. We map whatever backend returns into a minimal
 * safe shape to satisfy types and runtime requirements.
 */
const toStreamClientUser = (rawUser: any) => {
  if (!rawUser?.id) return undefined;

  return {
    id: String(rawUser.id),
    name: rawUser.name ?? rawUser.fullName ?? rawUser.username ?? undefined,
    image: rawUser.image ?? rawUser.avatar ?? rawUser.profileImage ?? undefined,
    // type: 'authenticated', // omit unless you explicitly use guest users
  };
};

const isWaitingForHostError = (err: unknown) => {
  const message = getApiErrorMessage(err, '').toLowerCase();
  return (
    message.includes('call has not been started') ||
    message.includes('call not started') ||
    message.includes('call is not live') ||
    message.includes('not live yet') ||
    message.includes('livestream has not started') ||
    message.includes('call session not found')
  );
};

const LiveCallStage = ({
  call,
  classroomTitle,
  onLeaveCall,
}: {
  call: StreamCallType;
  classroomTitle: string;
  onLeaveCall: () => Promise<void>;
}) => {
  const insets = useSafeAreaInsets();
  const [participantCount, setParticipantCount] = useState<number>(() => getParticipantCountFromCall(call));

  useEffect(() => {
    let mounted = true;

    const sync = () => {
      if (!mounted) return;
      setParticipantCount(getParticipantCountFromCall(call));
    };

    sync();

    const unsubscribers: Array<() => void> = [];

    const tryOn = (eventName: string) => {
      const anyCall = call as any;
      if (typeof anyCall?.on === 'function') {
        const handler = () => sync();
        anyCall.on(eventName, handler);
        unsubscribers.push(() => anyCall.off?.(eventName, handler));
      }
    };

    tryOn('call.participant_joined');
    tryOn('call.participant_left');
    tryOn('call.session_participant_joined');
    tryOn('call.session_participant_left');
    tryOn('call.updated');
    tryOn('call.session_updated');

    return () => {
      mounted = false;
      unsubscribers.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    };
  }, [call]);

  const handleBack = async () => {
    await onLeaveCall();
  };

  return (
    <View style={[styles.liveContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.videoContainer}>
        {/* ✅ RN SDK: use CallContent for full-screen video UI */}
        <CallContent />
      </View>

      <LiveTopBar title={classroomTitle} participantCount={participantCount} onPressBack={handleBack} />
    </View>
  );
};

export const LiveClassroomScreen = () => {
  const router = useRouter();
  const { mode: modeParam, classroomId, title } = useLocalSearchParams<{
    mode?: string;
    classroomId?: string;
    title?: string;
  }>();

  const normalizedClassroomId = normalizeParam(classroomId);
  const normalizedTitle = normalizeParam(title);
  const mode = normalizeMode(normalizeParam(modeParam));

  const accessToken = useAuthStore((state) => state.accessToken);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);

  const [bootstrap, setBootstrap] = useState<StreamBootstrapResponse | null>(null);
  const [client, setClient] = useState<StreamClientType | null>(null);
  const [call, setCall] = useState<StreamCallType | null>(null);
  const [status, setStatus] = useState<'loading' | 'connecting' | 'waiting' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<StreamClientType | null>(null);
  const callRef = useRef<StreamCallType | null>(null);
  const isActiveRef = useRef(true);
  const hasJoinedRef = useRef(false);
  const connectingRef = useRef(false);
  const hasLeftRef = useRef(false);
  const disconnectingRef = useRef(false);
  const lastJoinAttemptRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const handleLeave = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    unmountedRef.current = false;
    isActiveRef.current = true;
    return () => {
      unmountedRef.current = true;
      isActiveRef.current = false;
    };
  }, []);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const requestMediaPermissions = useCallback(
    async (data: StreamBootstrapResponse, resolvedMode: 'host' | 'participant') => {
      if (resolvedMode !== 'host') {
        return { micGranted: false, cameraGranted: false };
      }
      let micGranted = false;
      if (data.permissions.canPublishAudio) {
        micGranted = Boolean(await webrtcPermissions.request({ name: 'microphone' }));
      }
      let cameraGranted = false;
      if (data.permissions.canPublishVideo) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        cameraGranted = permission.granted;
      }
      return { micGranted, cameraGranted };
    },
    []
  );

  const configureMediaAfterJoin = useCallback(
    async (streamCall: StreamCallType, data: StreamBootstrapResponse, resolvedMode: 'host' | 'participant') => {
      await streamCall.microphone.disable();
      await streamCall.camera.disable();

      if (resolvedMode !== 'host') return;

      const { micGranted, cameraGranted } = await requestMediaPermissions(data, resolvedMode);

      if (data.permissions.canPublishAudio && micGranted) {
        await streamCall.microphone.enable();
      }

      if (data.permissions.canPublishVideo && cameraGranted) {
        await streamCall.camera.enable();
      }
    },
    [requestMediaPermissions]
  );

  const attemptJoin = useCallback(
    async (
      streamCall: StreamCallType,
      data: StreamBootstrapResponse,
      resolvedMode: 'host' | 'participant',
      options?: { force?: boolean }
    ) => {
      if (hasJoinedRef.current || connectingRef.current) return;

      const now = Date.now();
      if (!options?.force && resolvedMode === 'participant' && now - lastJoinAttemptRef.current < RETRY_DELAY_MS) {
        return;
      }

      connectingRef.current = true;
      lastJoinAttemptRef.current = now;
      setStatus('connecting');

      try {
        await streamCall.microphone.disable();
        await streamCall.camera.disable();
        await streamCall.join({ create: resolvedMode === 'host' });
        if (!isActiveRef.current) return;
        hasJoinedRef.current = true;
        setStatus('ready');
        await configureMediaAfterJoin(streamCall, data, resolvedMode);
      } catch (err) {
        if (!isActiveRef.current) return;
        if (resolvedMode === 'participant' && isWaitingForHostError(err)) {
          setStatus('waiting');
          clearRetryTimeout();
          retryTimeoutRef.current = setTimeout(() => {
            void attemptJoin(streamCall, data, resolvedMode);
          }, RETRY_DELAY_MS);
        } else {
          setError(getApiErrorMessage(err, 'Unable to join live class.'));
          setStatus('error');
        }
      } finally {
        connectingRef.current = false;
      }
    },
    [clearRetryTimeout, configureMediaAfterJoin]
  );

  const leaveCallOnce = useCallback(
    async (options?: { call?: StreamCallType | null; client?: StreamClientType | null }) => {
      if (hasLeftRef.current || disconnectingRef.current) return;
      disconnectingRef.current = true;
      hasLeftRef.current = true;

      const callToLeave = options?.call ?? call;
      const clientToDisconnect = options?.client ?? client;

      try {
        await callToLeave?.leave();
      } catch {}

      try {
        await clientToDisconnect?.disconnectUser();
      } catch {}
    },
    [call, client]
  );

  useEffect(() => {
    if (!normalizedClassroomId) {
      setError('Missing classroom details.');
      setStatus('error');
      return;
    }

    if (!accessToken) {
      setPendingAction(() =>
        router.replace({
          pathname: '/live-demo',
          params: { classroomId: normalizedClassroomId, mode, title: normalizedTitle ?? '' },
        })
      );
      router.push('/auth');
      return;
    }

    let isActive = true;
    let currentClient: StreamClientType | null = null;
    let currentCall: StreamCallType | null = null;

    const ensureClient = (data: StreamBootstrapResponse, user: { id: string; name?: string; image?: string }) => {
      if (clientRef.current) return clientRef.current;
      const getOrCreate = (StreamVideoClient as unknown as {
        getOrCreateInstance?: (options: { apiKey: string; user: { id: string; name?: string; image?: string }; token: string }) => StreamClientType;
      }).getOrCreateInstance;
      if (typeof getOrCreate === 'function') {
        clientRef.current = getOrCreate({
          apiKey: data.apiKey,
          user,
          token: data.token,
        });
      } else {
        clientRef.current = new StreamVideoClient({
          apiKey: data.apiKey,
          user,
          token: data.token,
        });
      }
      return clientRef.current;
    };

    const ensureCall = (streamClient: StreamClientType, callId: string) => {
      if (!callRef.current) {
        callRef.current = streamClient.call('livestream', callId);
      }
      return callRef.current;
    };

    const setup = async () => {
      setStatus('loading');
      setError(null);

      try {
        const data = await streamService.bootstrapLiveClassroom({
          classroomId: normalizedClassroomId,
          mode,
        });
        if (!isActive) return;

        const resolvedMode = mode;
        const invalidId = data.callId === '0' || data.user?.id === '0';
        if (!data.apiKey || !data.callId || !data.token || !data.user?.id || invalidId) {
          throw new Error('Stream credentials are missing.');
        }

        const user = toStreamClientUser(data.user);
        if (!user) {
          throw new Error('Stream user is missing.');
        }

        const streamClient = ensureClient(data, user);
        const streamCall = ensureCall(streamClient, data.callId);

        currentClient = streamClient;
        currentCall = streamCall;

        setBootstrap({ ...data, mode: resolvedMode });
        setClient(streamClient);
        setCall(streamCall);

        await attemptJoin(streamCall, data, resolvedMode);
      } catch (err) {
        if (!isActive) return;
        setError(getApiErrorMessage(err, 'Unable to join live class.'));
        setStatus('error');
      }
    };

    setup();

    return () => {
      isActive = false;
      clearRetryTimeout();

      // cleanup
      setTimeout(() => {
        if (!unmountedRef.current) return;
        leaveCallOnce({ call: currentCall, client: currentClient });
      }, 0);
    };
  }, [accessToken, attemptJoin, clearRetryTimeout, leaveCallOnce, mode, normalizedClassroomId, normalizedTitle, router, setPendingAction]);

  const handleRetry = useCallback(() => {
    if (!callRef.current || !bootstrap) return;
    clearRetryTimeout();
    lastJoinAttemptRef.current = 0;
    void attemptJoin(callRef.current, bootstrap, bootstrap.mode, { force: true });
  }, [attemptJoin, bootstrap, clearRetryTimeout]);

  const headerTitle = useMemo(
    () => (normalizedTitle && normalizedTitle.length ? normalizedTitle : 'Live classroom'),
    [normalizedTitle]
  );

  if (status === 'loading' || status === 'connecting' || status === 'waiting') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color={colors.mutedText}>
          {status === 'waiting' ? 'Waiting for the host to start the live class...' : 'Connecting to live classroom...'}
        </Text>
        {status === 'waiting' && (
          <Text weight="600" color={colors.primary} onPress={handleRetry}>
            Retry now
          </Text>
        )}
      </SafeAreaView>
    );
  }

  if (status === 'error' || error || !client || !call || !bootstrap) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text variant="body" color={colors.mutedText}>
          {error ?? 'Unable to start live classroom.'}
        </Text>
        <Text weight="600" color={colors.primary} onPress={handleLeave}>
          Go back
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <LiveCallStage
            call={call}
            classroomTitle={headerTitle}
            onLeaveCall={async () => {
              await leaveCallOnce();
              handleLeave();
            }}
          />
        </StreamCall>
      </StreamVideo>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textDark,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.textDark,
  },
  liveContainer: {
    flex: 1,
    backgroundColor: colors.textDark,
  },
  videoContainer: {
    flex: 1,
  },
});
