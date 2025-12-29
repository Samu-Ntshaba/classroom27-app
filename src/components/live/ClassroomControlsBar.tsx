import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CallControls } from '@stream-io/video-react-native-sdk';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ClassroomControlsBarProps = {
  onRaiseHand: () => void;
  onReaction: (emoji: string) => void;
  onShowParticipants: () => void;
  onHangUp: () => void;
};

const REACTIONS = ['👍', '👏', '🎉', '❤️'];

export const ClassroomControlsBar = memo(
  ({ onRaiseHand, onReaction, onShowParticipants, onHangUp }: ClassroomControlsBarProps) => {
    const insets = useSafeAreaInsets();

    return (
      <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.controlsRow}>
          <CallControls onHangupCallHandler={onHangUp} />
        </View>
        <View style={styles.customRow}>
          <TouchableOpacity style={styles.customButton} onPress={onRaiseHand}>
            <Text style={styles.customIcon}>✋</Text>
            <Text style={styles.customLabel}>Raise hand</Text>
          </TouchableOpacity>
          <View style={styles.reactions}>
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
          <TouchableOpacity style={styles.customButton} onPress={onShowParticipants}>
            <Text style={styles.customIcon}>👥</Text>
            <Text style={styles.customLabel}>Participants</Text>
          </TouchableOpacity>
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
  },
  controlsRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  customIcon: {
    fontSize: 16,
    color: '#F9FAFB',
  },
  customLabel: {
    color: '#E5E7EB',
    fontSize: 10,
    marginTop: 2,
  },
  reactions: {
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
