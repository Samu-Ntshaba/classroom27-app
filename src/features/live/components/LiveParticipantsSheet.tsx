import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { Text } from '../../../components/ui/Text';
import { Avatar } from '../../../components/ui/Avatar';

export interface LiveParticipant {
  userId: string;
  name?: string;
  image?: string | null;
  isLocalParticipant?: boolean;
  role?: string;
  roles?: string[];
  user?: {
    id?: string;
    name?: string;
    image?: string | null;
  };
}

interface LiveParticipantsSheetProps {
  visible: boolean;
  participants: LiveParticipant[];
  mode: 'host' | 'participant';
  onClose: () => void;
}

const isHostParticipant = (participant: LiveParticipant, mode: 'host' | 'participant') => {
  if (participant.role === 'host') return true;
  if (participant.roles?.includes('host')) return true;
  if (participant.isLocalParticipant && mode === 'host') return true;
  return false;
};

export const LiveParticipantsSheet = ({ visible, participants, mode, onClose }: LiveParticipantsSheetProps) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text variant="h3" weight="700">
              Participants
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text weight="600" color={colors.primary}>
                Close
              </Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {participants.map((participant, index) => {
              const displayName = participant.name ?? participant.user?.name ?? 'Student';
              const avatarUrl = participant.image ?? participant.user?.image ?? null;
              const isHost = isHostParticipant(participant, mode);
              const key = participant.userId ?? participant.user?.id ?? `participant-${index}`;
              return (
                <View key={key} style={styles.row}>
                  <Avatar uri={avatarUrl} name={displayName} size={44} />
                  <View style={styles.meta}>
                    <Text weight="600">{displayName}</Text>
                    {isHost ? (
                      <View style={styles.badge}>
                        <Text variant="small" weight="700" color={colors.textDark}>
                          Host
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
            {!participants.length ? (
              <Text variant="small" color={colors.mutedText}>
                Waiting for others to join...
              </Text>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 22, 42, 0.6)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.action,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
});
