import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ModalCard } from '../ui/ModalCard';
import { Text } from '../ui/Text';

interface AuthModalShellProps {
  children: React.ReactNode;
  title: string;
}

export const AuthModalShell = ({ children, title }: AuthModalShellProps) => {
  const router = useRouter();

  return (
    <View style={styles.overlay}>
      <ModalCard style={styles.card}>
        <View style={styles.header}>
          <Text variant="h3" weight="700">
            {title}
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text weight="600" color={colors.mutedText}>
              Close
            </Text>
          </Pressable>
        </View>
        {children}
      </ModalCard>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
});
