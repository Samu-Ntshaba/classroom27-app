import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GridLayout,
  SpeakerLayout,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Text } from '../../components/ui/Text';
import { useAuthStore } from '../../store/auth.store';
import { getApiErrorMessage } from '../../utils/error';
import { streamService, StreamBootstrapResponse } from '../../services/stream.service';
import { LiveControls } from './components/LiveControls';
import { LiveParticipantsSheet, LiveParticipant } from './components/LiveParticipantsSheet';
import { LiveTopBar } from './components/LiveTopBar';

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const normalizeMode = (value?: string) => (value === 'host' ? 'host' : 'participant');
type StreamCallType = ReturnType<StreamVideoClient['call']>;

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
  const { useParticipantCount, useParticipants } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const participants = useParticipants() as LiveParticipant[];
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [raisedHand, setRaisedHand] = useState(false);

  const handleReact = (emoji: string) => {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 1500);
  };

  const handleRaiseHand = () => {
    setRaisedHand(true);
    setTimeout(() => setRaisedHand(false), 1500);
  };

  const isGrid = participantCount > 2;
  const handleBack = async () => {
    await call.leave();
    onLeave();
  };

  return (
    <View style={styles.liveContainer}>
      <View style={styles.videoContainer}>
        {isGrid ? <GridLayout /> : <SpeakerLayout />}
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
  const [client, setClient] = useState<StreamVideoClient | null>(null);
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
    let currentClient: StreamVideoClient | null = null;
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

        const streamClient = new StreamVideoClient({
          apiKey: data.apiKey,
          user: data.user,
          token: data.token,
        });
        const streamCall = streamClient.call('livestream', data.callId);
        currentClient = streamClient;
        currentCall = streamCall;

        await streamCall.join({ create: mode === 'host' });

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
