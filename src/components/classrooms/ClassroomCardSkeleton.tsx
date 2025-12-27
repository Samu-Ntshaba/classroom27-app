import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { SkeletonBlock } from '../ui/Skeleton';

interface ClassroomCardSkeletonProps {
  variant?: 'rail' | 'list';
}

export const ClassroomCardSkeleton = ({ variant = 'list' }: ClassroomCardSkeletonProps) => {
  return (
    <View style={[styles.card, variant === 'rail' && styles.cardRail]}>
      <SkeletonBlock style={styles.cover} radius={0} />
      <View style={styles.content}>
        <SkeletonBlock style={styles.title} radius={10} />
        <SkeletonBlock style={styles.host} radius={10} />
        <View style={styles.pills}>
          <SkeletonBlock style={styles.pill} radius={8} />
          <SkeletonBlock style={styles.pill} radius={8} />
        </View>
        {variant === 'list' ? <SkeletonBlock style={styles.cta} radius={12} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardRail: {
    width: 220,
    marginRight: spacing.md,
  },
  cover: {
    height: 120,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    height: 16,
    marginBottom: spacing.sm,
  },
  host: {
    height: 12,
    width: '60%',
    marginBottom: spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    width: 48,
    height: 18,
  },
  cta: {
    height: 36,
  },
});
