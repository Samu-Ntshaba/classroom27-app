import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SkeletonBlock } from '../ui/Skeleton';
import { spacing } from '../../theme/spacing';

const data = Array.from({ length: 6 }).map((_, index) => ({ id: `rail-${index}` }));

export const HorizontalRailSkeleton = () => {
  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      renderItem={() => (
        <View style={styles.card}>
          <SkeletonBlock style={styles.cardBody} radius={18} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    width: 160,
  },
  cardBody: {
    height: 110,
  },
});
