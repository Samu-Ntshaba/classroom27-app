import { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Call,
  GridLayout,
  SpeakerLayout,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { ClassroomTopBar } from '../../components/live/ClassroomTopBar';
import { ClassroomControlsBar } from '../../components/live/ClassroomControlsBar';
import { ParticipantsSheet } from '../../components/live/ParticipantsSheet';
import { WaitingForHost } from '../../components/live/WaitingForHost';
import {
  STREAM_API_KEY,
  STREAM_TOKENS,
  STREAM_USERS,
  type StreamUserMode,
} from '../../constants/stream';

type JoinState = 'idle' | 'joining' | 'joined' | 'waiting' | 'error';

type CustomEventPayload = {
  type: 'hand_raised' | 'reaction' | 'stage_invite';
  userId?: string;
  userName?: string;
  emoji?: string;
  targetUserId?: string;
};

const getClient = (
  user: { id: string; name: string; image?: string },
  token: string,
) => {
  const creator = (StreamVideoClient as unknown as { getOrCreateInstance?: Function })
    .getOrCreateInstance;
  if (creator) {
    return creator({ apiKey: STREAM_API_KEY, user, token });
  }

  return new StreamVideoClient({ apiKey: STREAM_API_KEY, user, token });
};

export default function LiveClassroomScreen() {
  const { classroomId, mode, title, user } = useLocalSearchParams<{
    classroomId: string;
    mode?: 'host' | 'participant';
    title?: string;
    user?: StreamUserMode;
  }>();

  const [joinState, setJoinState] = useState<JoinState>('idle');
  const [layoutMode, setLayoutMode] = useState<'speaker' | 'grid'>('speaker');
  const [permissionsDenied, setPermissionsDenied] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [handRaiseQueue, setHandRaiseQueue] = useState<
    { id: string; name: string; role?: string }[]
  >([]);
  const [stageInvite, setStageInvite] = useState<CustomEventPayload | null>(null);
  const [reactionTrail, setReactionTrail] = useState<CustomEventPayload[]>([]);

  const isHost = mode === 'host';
  const userMode: StreamUserMode = isHost ? 'host' : user ?? 'learner1';
  const currentUser = STREAM_USERS[userMode];
  const token = STREAM_TOKENS[userMode];

  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const joinInProgressRef = useRef(false);
  const leftRef = useRef(false);

  if (!clientRef.current) {
    clientRef.current = getClient(currentUser, token);
  }

  const call = useMemo(() => {
    if (!clientRef.current) {
      return null;
    }
    const callId = `classroom-${classroomId}`;
    const nextCall = clientRef.current.call('default', callId);
    callRef.current = nextCall;
    return nextCall;
  }, [classroomId]);

  useEffect(() => {
    let isMounted = true;

    const requestPermissions = async () => {
      const camera = await Camera.requestCameraPermissionsAsync();
      const mic = await Audio.requestPermissionsAsync();
      if (!isMounted) {
        return;
      }
      const denied =
        camera.status !== 'granted' ||
        mic.status !== 'granted' ||
        !camera.granted ||
        !mic.granted;
      setPermissionsDenied(denied);
    };

    requestPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const joinCall = async () => {
    if (!call || joinInProgressRef.current) {
      return;
    }
    joinInProgressRef.current = true;
    setJoinState('joining');

    try {
      await call.join({ create: isHost });
      setJoinState('joined');

      if (isHost && !permissionsDenied) {
        await call.camera.enable();
        await call.microphone.enable();
      } else {
        await call.camera.disable();
        await call.microphone.disable();
      }
    } catch (error) {
      if (!isHost) {
        setJoinState('waiting');
      } else {
        setJoinState('error');
      }
    } finally {
      joinInProgressRef.current = false;
    }
  };

  useEffect(() => {
    if (!call || joinState !== 'idle') {
      return;
    }
    joinCall();
  }, [call, joinState]);

  useEffect(() => {
    if (!call) {
      return;
    }

    const handleCustomEvent = (event: any) => {
      const payload: CustomEventPayload = event.custom ?? event;
      if (!payload || !payload.type) {
        return;
      }

      if (payload.type === 'hand_raised' && payload.userId && payload.userName) {
        setHandRaiseQueue((prev) => {
          if (prev.find((item) => item.id === payload.userId)) {
            return prev;
          }
          return [...prev, { id: payload.userId, name: payload.userName }];
        });
      }

      if (payload.type === 'reaction' && payload.emoji) {
        setReactionTrail((prev) => [...prev.slice(-4), payload]);
      }

      if (payload.type === 'stage_invite' && payload.targetUserId === currentUser.id) {
        setStageInvite(payload);
      }
    };

    call.on('custom', handleCustomEvent);

    return () => {
      call.off('custom', handleCustomEvent);
    };
  }, [call, currentUser.id]);

  useEffect(() => {
    return () => {
      const leaveAsync = async () => {
        if (leftRef.current) {
          return;
        }
        leftRef.current = true;
        try {
          await callRef.current?.leave();
        } catch (error) {
          // ignore
        }
        try {
          await clientRef.current?.disconnectUser();
        } catch (error) {
          // ignore
        }
      };
      void leaveAsync();
    };
  }, []);

  const handleRaiseHand = async () => {
    if (!call) {
      return;
    }
    const payload: CustomEventPayload = {
      type: 'hand_raised',
      userId: currentUser.id,
      userName: currentUser.name,
    };
    try {
      await call.sendCustomEvent(payload);
    } catch (error) {
      setHandRaiseQueue((prev) => {
        if (prev.find((item) => item.id === currentUser.id)) {
          return prev;
        }
        return [...prev, { id: currentUser.id, name: currentUser.name }];
      });
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!call) {
      return;
    }
    const payload: CustomEventPayload = {
      type: 'reaction',
      emoji,
      userId: currentUser.id,
    };
    try {
      await call.sendCustomEvent(payload);
    } catch (error) {
      setReactionTrail((prev) => [...prev.slice(-4), payload]);
    }
  };

  const handleInviteToStage = async (participantId: string) => {
    if (!call) {
      return;
    }
    const payload: CustomEventPayload = {
      type: 'stage_invite',
      targetUserId: participantId,
    };
    try {
      await call.sendCustomEvent(payload);
    } finally {
      setHandRaiseQueue((prev) => prev.filter((item) => item.id !== participantId));
    }
  };

  const handleAcceptStageInvite = async () => {
    if (!call) {
      setStageInvite(null);
      return;
    }
    await call.microphone.enable();
    await call.camera.enable();
    setStageInvite(null);
  };

  const handleLeave = async () => {
    if (leftRef.current) {
      return;
    }
    leftRef.current = true;
    try {
      await call?.leave();
    } catch (error) {
      // ignore
    }
    try {
      await clientRef.current?.disconnectUser();
    } catch (error) {
      // ignore
    }
    router.replace('/live');
  };

  const subtitle = isHost
    ? 'Host controls enabled'
    : permissionsDenied
      ? 'Permissions denied: joined as viewer'
      : 'Mic & camera muted by default';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StreamVideo client={clientRef.current!}>
        <StreamCall call={call!}>
          <ClassroomCallContent
            title={title || 'Classroom 27 Live'}
            subtitle={subtitle}
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            permissionsDenied={permissionsDenied}
            joinState={joinState}
            reactionTrail={reactionTrail}
            stageInvite={stageInvite}
            onAcceptStageInvite={handleAcceptStageInvite}
            onRaiseHand={handleRaiseHand}
            onReaction={handleReaction}
            onLeave={handleLeave}
            onRetryJoin={joinCall}
            isHost={isHost}
            handRaiseQueue={handRaiseQueue}
            participantsVisible={participantsVisible}
            setParticipantsVisible={setParticipantsVisible}
            onInviteToStage={handleInviteToStage}
            currentUserId={currentUser.id}
          />
        </StreamCall>
      </StreamVideo>
    </SafeAreaView>
  );
}

type ClassroomCallContentProps = {
  title: string;
  subtitle: string;
  layoutMode: 'speaker' | 'grid';
  setLayoutMode: (next: 'speaker' | 'grid') => void;
  permissionsDenied: boolean;
  joinState: JoinState;
  reactionTrail: CustomEventPayload[];
  stageInvite: CustomEventPayload | null;
  onAcceptStageInvite: () => void;
  onRaiseHand: () => void;
  onReaction: (emoji: string) => void;
  onLeave: () => void;
  onRetryJoin: () => void;
  isHost: boolean;
  handRaiseQueue: { id: string; name: string; role?: string }[];
  participantsVisible: boolean;
  setParticipantsVisible: (next: boolean) => void;
  onInviteToStage: (participantId: string) => void;
  currentUserId: string;
};

function ClassroomCallContent({
  title,
  subtitle,
  layoutMode,
  setLayoutMode,
  permissionsDenied,
  joinState,
  reactionTrail,
  stageInvite,
  onAcceptStageInvite,
  onRaiseHand,
  onReaction,
  onLeave,
  onRetryJoin,
  isHost,
  handRaiseQueue,
  participantsVisible,
  setParticipantsVisible,
  onInviteToStage,
  currentUserId,
}: ClassroomCallContentProps) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const participantSummaries = participants.map((participant) => ({
    id: participant.userId,
    name: participant.name || participant.user?.name || participant.userId,
    role: participant.userId === currentUserId ? 'You' : undefined,
  }));

  const handRaiseSummaries = handRaiseQueue.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  return (
    <View style={styles.container}>
      <ClassroomTopBar
        title={title}
        subtitle={subtitle}
        layoutMode={layoutMode}
        onToggleLayout={() =>
          setLayoutMode(layoutMode === 'speaker' ? 'grid' : 'speaker')
        }
        onLeave={onLeave}
      />

      {permissionsDenied ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Camera/mic permissions denied. You can still watch the classroom.
          </Text>
        </View>
      ) : null}

      {joinState === 'waiting' ? (
        <WaitingForHost onRetry={onRetryJoin} />
      ) : (
        <View style={styles.videoStage}>
          {layoutMode === 'speaker' ? <SpeakerLayout /> : <GridLayout />}
          <View style={styles.reactionsOverlay}>
            {reactionTrail.map((reaction, index) => (
              <Text key={`${reaction.emoji}-${index}`} style={styles.reactionBubble}>
                {reaction.emoji}
              </Text>
            ))}
          </View>
        </View>
      )}

      {stageInvite ? (
        <View style={styles.stageInvite}>
          <Text style={styles.stageInviteText}>The host invited you to the stage.</Text>
          <Text style={styles.stageInviteHint}>
            Tap Accept to enable your mic and camera.
          </Text>
          <Text style={styles.stageInviteAction} onPress={onAcceptStageInvite}>
            Accept invite
          </Text>
        </View>
      ) : null}

      <ClassroomControlsBar
        onRaiseHand={onRaiseHand}
        onReaction={onReaction}
        onShowParticipants={() => setParticipantsVisible(true)}
        onHangUp={onLeave}
      />

      <ParticipantsSheet
        isVisible={participantsVisible}
        isHost={isHost}
        participants={participantSummaries}
        handRaiseQueue={handRaiseSummaries}
        onClose={() => setParticipantsVisible(false)}
        onInviteToStage={onInviteToStage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  banner: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerText: {
    color: '#FBBF24',
    fontSize: 12,
  },
  videoStage: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  reactionsOverlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    alignItems: 'center',
    gap: 6,
  },
  reactionBubble: {
    fontSize: 20,
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stageInvite: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 150,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
  },
  stageInviteText: {
    color: '#F9FAFB',
    fontWeight: '600',
    marginBottom: 6,
  },
  stageInviteHint: {
    color: '#CBD5F5',
    fontSize: 12,
    marginBottom: 10,
  },
  stageInviteAction: {
    color: '#60A5FA',
    fontWeight: '600',
  },
});
