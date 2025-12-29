import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Text } from '../../components/ui/Text';
import { DEMO_CLASSROOM } from './demoClassroom';

interface DemoLiveCardProps {
  onPressJoin: () => void;
}

export const DemoLiveCard = ({ onPressJoin }: DemoLiveCardProps) => {
  return (
    <Pressable style={styles.card} onPress={onPressJoin}>
      <View style={styles.headerRow}>
        <View>
          <Text variant="h3" weight="700">
            {DEMO_CLASSROOM.title}
          </Text>
          <Text variant="small" color={colors.mutedText} style={styles.description}>
            {DEMO_CLASSROOM.description}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text variant="small" weight="700" color={colors.textDark}>
            LIVE DEMO
          </Text>
        </View>
      </View>
      <Pressable style={styles.joinButton} onPress={onPressJoin}>
        <Text weight="600" color={colors.textDark}>
          Join live
        </Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  description: {
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: colors.action,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  joinButton: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: colors.action,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
});
