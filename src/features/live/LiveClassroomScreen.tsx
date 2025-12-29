import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLeftRef = useRef(false);

  const handleLeave = useCallback(() => {
    router.back();
  }, [router]);

  const leaveCallOnce = useCallback(
    async (options?: { call?: StreamCallType | null; client?: StreamClientType | null }) => {
      if (hasLeftRef.current) return;
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
      setLoading(false);
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

    const setup = async () => {
      setLoading(true);
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

        const streamClient = new StreamVideoClient({
          apiKey: data.apiKey,
          user,
          token: data.token, // must be generated for user.id
        });

        const streamCall = streamClient.call('livestream', data.callId);

        currentClient = streamClient;
        currentCall = streamCall;

        await streamCall.join({ create: resolvedMode === 'host' });

        if (data.permissions.canPublishAudio) {
          await streamCall.microphone.enable();
        } else {
          await streamCall.microphone.disable();
        }

        let cameraPermissionGranted = true;
        if (data.permissions.canPublishVideo) {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          cameraPermissionGranted = permission.granted;
        }

        if (data.permissions.canPublishVideo && cameraPermissionGranted) {
          await streamCall.camera.enable();
        } else {
          await streamCall.camera.disable();
        }

        if (!isActive) return;
        setBootstrap({ ...data, mode: resolvedMode });
        setClient(streamClient);
        setCall(streamCall);
      } catch (err) {
        if (!isActive) return;
        setError(getApiErrorMessage(err, 'Unable to join live class.'));
      } finally {
        if (isActive) setLoading(false);
      }
    };

    setup();

    return () => {
      isActive = false;

      // cleanup
      leaveCallOnce({ call: currentCall, client: currentClient });
    };
  }, [accessToken, leaveCallOnce, mode, normalizedClassroomId, normalizedTitle, router, setPendingAction]);

  const headerTitle = useMemo(
    () => (normalizedTitle && normalizedTitle.length ? normalizedTitle : 'Live classroom'),
    [normalizedTitle]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color={colors.mutedText}>
          Connecting to live classroom...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !client || !call || !bootstrap) {
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
