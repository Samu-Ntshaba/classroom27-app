import { useMemo } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallStateHooks } from '@stream-io/video-react-native-sdk';

type ParticipantsSheetProps = {
  isVisible: boolean;
  isHost: boolean;
  onClose: () => void;
};

export function ParticipantsSheet({ isVisible, isHost, onClose }: ParticipantsSheetProps) {
  const insets = useSafeAreaInsets();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const sortedParticipants = useMemo(() => {
    const formatted = participants.map((participant) => ({
      id: participant.userId,
      name: participant.name || participant.user?.name || participant.userId,
      isLocal: participant.userId === localParticipant?.userId,
    }));

    return formatted.sort((a, b) => a.name.localeCompare(b.name));
  }, [localParticipant?.userId, participants]);

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16, paddingTop: 16 },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Participants {isHost ? '(Host controls)' : ''}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {sortedParticipants.length === 0 ? (
              <Text style={styles.emptyText}>No participants yet.</Text>
            ) : (
              sortedParticipants.map((participant) => (
                <View key={participant.id} style={styles.participantRow}>
                  <View>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    {participant.isLocal ? (
                      <Text style={styles.participantRole}>You</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600',
  },
  closeText: {
    color: '#93C5FD',
    fontWeight: '500',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  participantName: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
  },
  participantRole: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
