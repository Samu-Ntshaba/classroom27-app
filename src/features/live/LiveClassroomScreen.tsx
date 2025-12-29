import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

import { LiveControls } from './components/LiveControls';
import { LiveParticipant, LiveParticipantsSheet } from './components/LiveParticipantsSheet';
import { LiveTopBar } from './components/LiveTopBar';

const normalizeParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
const normalizeMode = (value?: string) => (value === 'host' ? 'host' : 'participant');

type StreamClientType = InstanceType<typeof StreamVideoClient>;
type StreamCallType = ReturnType<StreamClientType['call']>;

/**
 * Extract participants from call state (RN SDK state shape can differ by version).
 */
const getParticipantsFromCall = (call: StreamCallType): LiveParticipant[] => {
  const anyState = call.state as any;

  const participantsMap: Record<string, LiveParticipant> | undefined =
    anyState?.participants ?? anyState?.participantsBySessionId ?? anyState?.participantsById;

  if (!participantsMap) return [];
  return Object.values(participantsMap) as LiveParticipant[];
};

const getParticipantCountFromCall = (call: StreamCallType) => {
  const anyState = call.state as any;
  const count = anyState?.participantCount ?? anyState?.participantsCount;
  if (typeof count === 'number') return count;
  return getParticipantsFromCall(call).length;
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
  mode,
  classroomTitle,
  permissions,
  onLeave,
}: {
  call: StreamCallType;
  mode: 'host' | 'participant';
  classroomTitle: string;
  permissions: StreamBootstrapResponse['permissions'];
  onLeave: () => void;
}) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [raisedHand, setRaisedHand] = useState(false);

  const [participants, setParticipants] = useState<LiveParticipant[]>(() => getParticipantsFromCall(call));
  const [participantCount, setParticipantCount] = useState<number>(() => getParticipantCountFromCall(call));

  useEffect(() => {
    let mounted = true;

    const sync = () => {
      if (!mounted) return;
      setParticipants(getParticipantsFromCall(call));
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

  const handleReact = (emoji: string) => {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 1500);
  };

  const handleRaiseHand = () => {
    setRaisedHand(true);
    setTimeout(() => setRaisedHand(false), 1500);
  };

  const handleBack = async () => {
    try {
      await call.leave();
    } catch {}
    onLeave();
  };

  return (
    <View style={styles.liveContainer}>
      <View style={styles.videoContainer}>
        {/* ✅ RN SDK: use CallContent for full-screen video UI */}
        <CallContent />
      </View>

      <LiveTopBar title={classroomTitle} participantCount={participantCount} onPressBack={handleBack} />

      <LiveControls
        call={call}
        permissions={permissions}
        onShowParticipants={() => setShowParticipants(true)}
        onShowChat={() => setShowChat(true)}
        onReact={handleReact}
        onRaiseHand={handleRaiseHand}
        onLeave={onLeave}
      />

      <LiveParticipantsSheet
        visible={showParticipants}
        participants={participants}
        mode={mode}
        onClose={() => setShowParticipants(false)}
      />

      <Modal visible={showChat} transparent animationType="slide">
        <View style={styles.chatBackdrop}>
          <View style={styles.chatSheet}>
            <Text variant="h3" weight="700">
              Chat
            </Text>
            <Text variant="body" color={colors.mutedText} style={styles.chatBody}>
              Chat coming soon.
            </Text>
            <View style={styles.chatClose}>
              <Text weight="600" color={colors.primary} onPress={() => setShowChat(false)}>
                Close
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {reaction ? (
        <View style={styles.reactionOverlay}>
          <Text variant="h2">{reaction}</Text>
        </View>
      ) : null}

      {raisedHand ? (
        <View style={styles.reactionOverlay}>
          <Text variant="h3">✋ Hand raised</Text>
        </View>
      ) : null}
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

  const handleLeave = useCallback(() => {
    router.back();
  }, [router]);

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

        if (!data.apiKey || !data.callId || !data.token || !data.user?.id) {
          throw new Error('Stream credentials are missing.');
        }

        // ✅ Map backend user -> Stream "UserRequest" shape expected by StreamVideoClient
        const user = toStreamClientUser(data.user);
        if (!user?.id) {
          throw new Error('Stream user is missing an id.');
        }

        const streamClient = new StreamVideoClient({
          apiKey: data.apiKey,
          user,
          token: data.token, // must be generated for user.id
        });

        const streamCall = streamClient.call('livestream', data.callId);

        currentClient = streamClient;
        currentCall = streamCall;

        await streamCall.join({ create: mode === 'host' });

        // Host vs participant device state
        if (data.permissions.canPublishAudio && mode === 'host') {
          await streamCall.microphone.enable();
        } else {
          await streamCall.microphone.disable();
        }

        if (data.permissions.canPublishVideo && mode === 'host') {
          await streamCall.camera.enable();
        } else {
          await streamCall.camera.disable();
        }

        if (!isActive) return;

        setBootstrap(data);
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
      if (currentCall) {
        currentCall.leave().catch(() => undefined);
      }
      if (currentClient) {
        currentClient.disconnectUser().catch(() => undefined);
      }
    };
  }, [accessToken, mode, normalizedClassroomId, normalizedTitle, router, setPendingAction]);

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
            mode={bootstrap.mode}
            classroomTitle={headerTitle}
            permissions={bootstrap.permissions}
            onLeave={handleLeave}
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
  reactionOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: 'rgba(15, 22, 42, 0.7)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 20,
  },
  chatBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 22, 42, 0.6)',
  },
  chatSheet: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatBody: {
    marginTop: spacing.sm,
  },
  chatClose: {
    marginTop: spacing.lg,
    alignItems: 'flex-end',
  },
});
