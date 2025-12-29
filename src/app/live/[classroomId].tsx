import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { permissions as webrtcPermissions } from '@stream-io/react-native-webrtc';
import { CallingState } from '@stream-io/video-client';
import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-native-sdk';

import { ClassroomControlsBar } from '../../components/live/ClassroomControlsBar';
import { ClassroomVideoStage } from '../../components/live/ClassroomVideoStage';
import { ParticipantsSheet } from '../../components/live/ParticipantsSheet';
import {
  StreamBootstrapResponse,
  streamService,
} from '../../services/stream.service';

type JoinState = 'idle' | 'joining' | 'joined' | 'waiting' | 'error' | 'loading';

type CustomEventPayload = {
  type: 'hand_raised' | 'reaction';
  userId?: string;
  userName?: string;
  emoji?: string;
};

type MediaPermissionsState = {
  camera: boolean;
  microphone: boolean;
  requested: boolean;
};

type StreamClientFactory = typeof StreamVideoClient & {
  getOrCreateInstance?: (options: {
    apiKey: string;
    token: string;
    user: { id: string; name?: string; image?: string | null };
  }) => StreamVideoClient;
};

let streamClientSingleton: StreamVideoClient | null = null;
let streamClientUserId: string | null = null;

const getStreamClient = (bootstrap: StreamBootstrapResponse) => {
  const factory = StreamVideoClient as StreamClientFactory;
  const user = {
    id: bootstrap.user.id,
    name: bootstrap.user.name ?? undefined,
    image: bootstrap.user.image ?? undefined,
  };

  if (factory.getOrCreateInstance) {
    return factory.getOrCreateInstance({
      apiKey: bootstrap.apiKey,
      user,
      token: bootstrap.token,
    });
  }

  if (!streamClientSingleton || streamClientUserId !== user.id) {
    streamClientSingleton = new StreamVideoClient({
      apiKey: bootstrap.apiKey,
      user,
      token: bootstrap.token,
    });
    streamClientUserId = user.id;
  }

  return streamClientSingleton;
};

const isWaitingForHostError = (error: unknown) => {
  if (!error) {
    return false;
  }
  const message = String(error).toLowerCase();
  return (
    message.includes('call has not been started') ||
    message.includes('call not started') ||
    message.includes('call is not live') ||
    message.includes('not live yet') ||
    message.includes('call session not found')
  );
};

const isCallConnecting = (call: Call) => {
  const callingState = call.state?.callingState;
  return (
    callingState === CallingState.JOINING ||
    callingState === CallingState.JOINED ||
    callingState === CallingState.RECONNECTING ||
    callingState === CallingState.MIGRATING
  );
};

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function LiveClassroomScreen() {
  const { classroomId, mode, title } = useLocalSearchParams<{
    classroomId: string;
    mode?: 'host' | 'participant';
    title?: string;
  }>();

  const [bootstrap, setBootstrap] = useState<StreamBootstrapResponse | null>(null);
  const [joinState, setJoinState] = useState<JoinState>('loading');
  const [permissions, setPermissions] = useState<MediaPermissionsState>({
    camera: false,
    microphone: false,
    requested: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'speaker' | 'grid'>('speaker');
  const [reactionTrail, setReactionTrail] = useState<CustomEventPayload[]>([]);

  const isHost = mode === 'host';

  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const joinInProgressRef = useRef(false);
  const leftRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const lastJoinAttemptRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loadBootstrap = async () => {
      if (!classroomId) {
        setJoinState('error');
        setErrorMessage('Missing classroom id.');
        return;
      }

      setJoinState('loading');
      setErrorMessage(null);

      try {
        const response = await streamService.bootstrapLiveClassroom({
          classroomId,
          mode: isHost ? 'host' : 'participant',
        });
        if (!mounted) {
          return;
        }
        setBootstrap(response);
        setJoinState('idle');
      } catch (error) {
        if (!mounted) {
          return;
        }
        setErrorMessage('Unable to start the live classroom.');
        setJoinState('error');
      }
    };

    loadBootstrap();

    return () => {
      mounted = false;
    };
  }, [classroomId, isHost]);

  useEffect(() => {
    let mounted = true;

    const requestPermissions = async () => {
      const micGranted = await webrtcPermissions.request({ name: 'microphone' });
      const cameraGranted = await webrtcPermissions.request({ name: 'camera' });

      if (!mounted) {
        return;
      }

      setPermissions({
        microphone: Boolean(micGranted),
        camera: Boolean(cameraGranted),
        requested: true,
      });
    };

    requestPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const client = useMemo(() => {
    if (!bootstrap?.apiKey || !bootstrap?.token || !bootstrap.user?.id) {
      return null;
    }

    const resolvedClient = getStreamClient(bootstrap);
    clientRef.current = resolvedClient;
    return resolvedClient;
  }, [bootstrap]);

  const call = useMemo(() => {
    if (!client || !bootstrap?.callId) {
      return null;
    }

    const nextCall = client.call('default', bootstrap.callId);
    callRef.current = nextCall;
    return nextCall;
  }, [client, bootstrap?.callId]);

  const scheduleRetry = useCallback(
    (reason: string, retryFn: () => void) => {
      if (isHost) {
        return;
      }

      retryAttemptRef.current += 1;
      const delay = Math.min(2000 * 2 ** (retryAttemptRef.current - 1), 30000);

      clearRetryTimeout();

      retryTimeoutRef.current = setTimeout(() => {
        if (!call || leftRef.current) {
          return;
        }
        console.log(`[LiveClassroom] retrying join after ${reason} (${delay}ms)`);
        retryFn();
      }, delay);
    },
    [call, clearRetryTimeout, isHost],
  );

  const joinCall = useCallback(async () => {
    if (!call || joinInProgressRef.current || leftRef.current) {
      return;
    }

    if (isCallConnecting(call)) {
      return;
    }

    const now = Date.now();
    if (now - lastJoinAttemptRef.current < 800) {
      return;
    }
    lastJoinAttemptRef.current = now;

    joinInProgressRef.current = true;
    setJoinState('joining');

    try {
      await call.join({ create: isHost });
      retryAttemptRef.current = 0;
      clearRetryTimeout();
      setJoinState('joined');

      if (isHost) {
        if (permissions.camera) {
          await call.camera.enable();
        } else {
          await call.camera.disable();
        }

        if (permissions.microphone) {
          await call.microphone.enable();
        } else {
          await call.microphone.disable();
        }
      } else {
        await call.camera.disable();
        await call.microphone.disable();
      }
    } catch (error) {
      const waiting = !isHost && isWaitingForHostError(error);
      setJoinState(waiting ? 'waiting' : 'error');
      if (waiting) {
        scheduleRetry('host-not-ready', () => void joinCall());
      } else {
        setErrorMessage('Unable to join the classroom.');
      }
    } finally {
      joinInProgressRef.current = false;
    }
  }, [call, clearRetryTimeout, isHost, permissions.camera, permissions.microphone, scheduleRetry]);

  useEffect(() => {
    if (joinState !== 'idle' || !call) {
      return;
    }

    void joinCall();
  }, [call, joinCall, joinState]);

  useEffect(() => {
    if (!call) {
      return;
    }

    const handleCustomEvent = (event: any) => {
      const payload = event?.custom ?? event;
      if (!payload?.type) {
        return;
      }

      if (payload.type === 'reaction' && payload.emoji) {
        setReactionTrail((prev) => [...prev.slice(-4), payload]);
      }
    };

    call.on('custom', handleCustomEvent);

    return () => {
      call.off('custom', handleCustomEvent);
    };
  }, [call]);

  const leaveCall = useCallback(
    async (navigate = true) => {
      if (leftRef.current) {
        return;
      }
      leftRef.current = true;
      clearRetryTimeout();

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

      if (navigate) {
        router.replace('/live');
      }
    },
    [clearRetryTimeout],
  );

  useEffect(() => {
    return () => {
      void leaveCall(false);
    };
  }, [leaveCall]);

  const handleRaiseHand = async () => {
    if (!call || !bootstrap) {
      return;
    }

    const payload: CustomEventPayload = {
      type: 'hand_raised',
      userId: bootstrap.user.id,
      userName: bootstrap.user.name,
    };

    try {
      await call.sendCustomEvent(payload);
    } catch (error) {
      console.log('[LiveClassroom] failed to send hand raise event', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!call || !bootstrap) {
      return;
    }

    const payload: CustomEventPayload = {
      type: 'reaction',
      emoji,
      userId: bootstrap.user.id,
    };

    try {
      await call.sendCustomEvent(payload);
      setReactionTrail((prev) => [...prev.slice(-4), payload]);
    } catch (error) {
      setReactionTrail((prev) => [...prev.slice(-4), payload]);
    }
  };

  const permissionsDenied =
    permissions.requested && (!permissions.camera || !permissions.microphone);

  const subtitle = isHost
    ? 'Host controls enabled'
    : permissionsDenied
      ? 'Permissions denied: joined as viewer'
      : 'Mic & camera muted by default';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {joinState === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#60A5FA" />
          <Text style={styles.statusText}>Preparing your classroom…</Text>
        </View>
      ) : null}

      {joinState !== 'loading' && !call ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{errorMessage ?? 'Unable to start call.'}</Text>
        </View>
      ) : null}

      {call ? (
        <StreamVideo client={client!}>
          <StreamCall call={call}>
            <View style={styles.container}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>{title ?? 'Classroom 27 Live'}</Text>
                  <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setLayoutMode((prev) => (prev === 'speaker' ? 'grid' : 'speaker'))
                  }
                >
                  <Text style={styles.layoutToggle}>
                    {layoutMode === 'speaker' ? 'Grid view' : 'Speaker view'}
                  </Text>
                </TouchableOpacity>
              </View>

              {permissionsDenied ? (
                <View style={styles.permissionsBanner}>
                  <Text style={styles.permissionsText}>
                    Camera or microphone permissions are disabled. Enable them in Settings
                    to share audio/video.
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openSettings()}>
                    <Text style={styles.permissionsAction}>Open Settings</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {joinState === 'waiting' ? (
                <View style={styles.centered}>
                  <Text style={styles.statusText}>Waiting for the host to start…</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={joinCall}>
                    <Text style={styles.retryText}>Retry now</Text>
                  </TouchableOpacity>
                </View>
              ) : joinState === 'error' ? (
                <View style={styles.centered}>
                  <Text style={styles.errorText}>{errorMessage ?? 'Unable to join call.'}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={joinCall}>
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ClassroomVideoStage layout={layoutMode} reactionTrail={reactionTrail} />
              )}

              <ClassroomControlsBar
                onRaiseHand={handleRaiseHand}
                onReaction={handleReaction}
                onShowParticipants={() => setParticipantsVisible(true)}
                onHangUp={() => void leaveCall(true)}
              />

              <ParticipantsSheet
                isVisible={participantsVisible}
                isHost={isHost}
                onClose={() => setParticipantsVisible(false)}
              />
            </View>
          </StreamCall>
        </StreamVideo>
      ) : null}
    </SafeAreaView>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  layoutToggle: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  permissionsBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  permissionsText: {
    color: '#FBBF24',
    fontSize: 12,
    marginBottom: 6,
  },
  permissionsAction: {
    color: '#60A5FA',
    fontWeight: '600',
  },
  statusText: {
    color: '#E5E7EB',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
