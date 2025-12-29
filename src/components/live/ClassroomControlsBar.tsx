import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallStateHooks } from '@stream-io/video-react-native-sdk';

type ClassroomControlsBarProps = {
  onRaiseHand: () => void;
  onReaction: (emoji: string) => void;
  onShowParticipants: () => void;
  onHangUp: () => void;
};

const REACTIONS = ['👍', '❤️', '👏'];

const ControlButton = ({
  label,
  icon,
  onPress,
  variant = 'default',
  disabled,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  variant?: 'default' | 'danger' | 'active';
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[
      styles.controlButton,
      variant === 'danger' && styles.controlButtonDanger,
      variant === 'active' && styles.controlButtonActive,
      disabled && styles.controlButtonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.controlIcon}>{icon}</Text>
    <Text style={styles.controlLabel}>{label}</Text>
  </TouchableOpacity>
);

export const ClassroomControlsBar = memo(
  ({ onRaiseHand, onReaction, onShowParticipants, onHangUp }: ClassroomControlsBarProps) => {
    const insets = useSafeAreaInsets();
    const { useCameraState, useMicrophoneState } = useCallStateHooks();
    const { camera, optimisticIsMute: cameraMuted } = useCameraState();
    const { microphone, optimisticIsMute: microphoneMuted } = useMicrophoneState();

    const toggleMic = async () => {
      if (microphoneMuted) {
        await microphone.enable();
      } else {
        await microphone.disable();
      }
    };

    const toggleCamera = async () => {
      if (cameraMuted) {
        await camera.enable();
      } else {
        await camera.disable();
      }
    };

    const flipCamera = async () => {
      await camera.flip();
    };

    return (
      <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.controlsRow}>
          <ControlButton
            label={microphoneMuted ? 'Unmute' : 'Mute'}
            icon={microphoneMuted ? '🎤' : '🔇'}
            onPress={() => void toggleMic()}
            variant={microphoneMuted ? 'active' : 'default'}
          />
          <ControlButton
            label={cameraMuted ? 'Start video' : 'Stop video'}
            icon={cameraMuted ? '📷' : '🎥'}
            onPress={() => void toggleCamera()}
            variant={cameraMuted ? 'active' : 'default'}
          />
          <ControlButton
            label="Flip"
            icon="🔄"
            onPress={() => void flipCamera()}
            disabled={cameraMuted}
          />
        </View>

        <View style={styles.controlsRow}>
          <ControlButton label="Raise" icon="✋" onPress={onRaiseHand} />
          <View style={styles.reactionsRow}>
            {REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionButton}
                onPress={() => onReaction(emoji)}
              >
                <Text style={styles.reactionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ControlButton label="People" icon="👥" onPress={onShowParticipants} />
          <ControlButton
            label="Leave"
            icon="🚪"
            onPress={onHangUp}
            variant="danger"
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B0B0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 64,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(59,130,246,0.3)',
  },
  controlButtonDanger: {
    backgroundColor: 'rgba(248,113,113,0.3)',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlIcon: {
    fontSize: 16,
    color: '#F9FAFB',
  },
  controlLabel: {
    color: '#E5E7EB',
    fontSize: 10,
    marginTop: 2,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  reactionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  reactionText: {
    fontSize: 16,
  },
});
