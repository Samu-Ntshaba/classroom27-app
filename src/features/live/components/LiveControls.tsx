import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCallStateHooks } from '@stream-io/video-react-native-sdk';
import type { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Text } from '../../../components/ui/Text';

interface LivePermissions {
  canPublishAudio: boolean;
  canPublishVideo: boolean;
  canScreenShare: boolean;
}

interface LiveControlsProps {
  call: ReturnType<StreamVideoClient['call']>;
  permissions: LivePermissions;
  onShowParticipants: () => void;
  onShowChat: () => void;
  onReact: (emoji: string) => void;
  onRaiseHand: () => void;
  onLeave: () => void;
}

export const LiveControls = ({
  call,
  permissions,
  onShowParticipants,
  onShowChat,
  onReact,
  onRaiseHand,
  onLeave,
}: LiveControlsProps) => {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const cameraState = useCameraState();
  const microphoneState = useMicrophoneState();
  const micEnabled = microphoneState?.isEnabled ?? false;
  const cameraEnabled = cameraState?.isEnabled ?? false;

  const handleToggleMic = async () => {
    if (!permissions.canPublishAudio) return;
    try {
      if (micEnabled) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
    } catch (error) {
      console.warn('Unable to toggle microphone', error);
    }
  };

  const handleToggleCamera = async () => {
    if (!permissions.canPublishVideo) return;
    try {
      if (cameraEnabled) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
    } catch (error) {
      console.warn('Unable to toggle camera', error);
    }
  };

  const handleFlipCamera = async () => {
    if (!cameraEnabled) return;
    try {
      await call.camera.flip();
    } catch (error) {
      console.warn('Unable to flip camera', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ControlButton
          icon={micEnabled ? 'mic' : 'mic-off'}
          label="Mic"
          onPress={handleToggleMic}
          disabled={!permissions.canPublishAudio}
          active={micEnabled}
        />
        <ControlButton
          icon={cameraEnabled ? 'videocam' : 'videocam-off'}
          label="Camera"
          onPress={handleToggleCamera}
          disabled={!permissions.canPublishVideo}
          active={cameraEnabled}
        />
        <ControlButton icon="camera-reverse" label="Flip" onPress={handleFlipCamera} />
        <ControlButton icon="people" label="People" onPress={onShowParticipants} />
        <ControlButton icon="chatbubbles" label="Chat" onPress={onShowChat} />
        <ControlButton icon="hand-left" label="Raise" onPress={onRaiseHand} accent />
        <ControlButton icon="happy" label="React" onPress={() => onReact('🎉')} accent />
        <ControlButton
          icon="log-out"
          label="Leave"
          onPress={async () => {
            try {
              await call.leave();
            } catch (error) {
              console.warn('Unable to leave call', error);
            } finally {
              onLeave();
            }
          }}
          danger
        />
      </View>
    </View>
  );
};

interface ControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  accent?: boolean;
  danger?: boolean;
}

const ControlButton = ({ icon, label, onPress, disabled, active, accent, danger }: ControlButtonProps) => {
  const backgroundColor = danger
    ? colors.danger
    : active
      ? colors.primary
      : accent
        ? colors.action
        : 'rgba(255, 255, 255, 0.18)';
  const iconColor = danger || active || accent ? colors.card : colors.card;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? 'rgba(255,255,255,0.08)' : backgroundColor,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
      disabled={disabled}
    >
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text variant="small" color={colors.card} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(15, 22, 42, 0.55)',
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  button: {
    width: '23%',
    minWidth: 72,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 14,
  },
  label: {
    marginTop: spacing.xs,
  },
});
