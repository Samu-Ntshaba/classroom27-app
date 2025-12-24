import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function SearchScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h2" weight="700">
          Search
        </Text>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
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
  card: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
