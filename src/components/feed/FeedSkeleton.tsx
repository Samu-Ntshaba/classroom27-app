import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonCard } from '../ui/Skeleton';
import { spacing } from '../../theme/spacing';

interface FeedSkeletonProps {
  count?: number;
}

export const FeedSkeleton = ({ count = 4 }: FeedSkeletonProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={`feed-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
