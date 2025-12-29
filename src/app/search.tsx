import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Text } from '../components/ui/Text';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const FILTERS = [
  { key: 'latest', label: 'For you' },
  { key: 'live', label: 'Live' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('latest');

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h2" weight="700">
          Search
        </Text>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
      <Input label="Search classes" placeholder="Search by topic or host" value={query} onChangeText={setQuery} />
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isActive = filter.key === activeFilter;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text variant="small" weight="600" color={isActive ? colors.textDark : colors.mutedText}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.card}>
        <Text variant="body" color={colors.mutedText}>
          Search experiences are coming next. Stay tuned for discovery and trending topics.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
