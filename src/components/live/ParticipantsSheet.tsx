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

export type ParticipantSummary = {
  id: string;
  name: string;
  role?: string;
};

type ParticipantsSheetProps = {
  isVisible: boolean;
  isHost: boolean;
  participants: ParticipantSummary[];
  handRaiseQueue: ParticipantSummary[];
  onClose: () => void;
  onInviteToStage: (participantId: string) => void;
};

export function ParticipantsSheet({
  isVisible,
  isHost,
  participants,
  handRaiseQueue,
  onClose,
  onInviteToStage,
}: ParticipantsSheetProps) {
  const insets = useSafeAreaInsets();
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => a.name.localeCompare(b.name));
  }, [participants]);

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
            <Text style={styles.title}>Participants</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          {isHost && handRaiseQueue.length > 0 ? (
            <View style={styles.queue}>
              <Text style={styles.sectionTitle}>Hand raise queue</Text>
              {handRaiseQueue.map((participant) => (
                <View key={participant.id} style={styles.queueItem}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => onInviteToStage(participant.id)}
                  >
                    <Text style={styles.inviteText}>Invite to stage</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {sortedParticipants.map((participant) => (
              <View key={participant.id} style={styles.participantRow}>
                <View>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  {participant.role ? (
                    <Text style={styles.participantRole}>{participant.role}</Text>
                  ) : null}
                </View>
                {isHost ? (
                  <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => onInviteToStage(participant.id)}
                  >
                    <Text style={styles.inviteText}>Invite</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
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
  queue: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  inviteButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  inviteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
