import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Text } from '../components/ui/Text';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);

  const isAuthenticated = Boolean(accessToken);
  const greeting = isAuthenticated ? `Hello, ${user?.name ?? 'Student'}` : 'Hello, Guest';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo />
      </View>
      <View style={styles.content}>
        <Text variant="h1" weight="700" style={styles.title}>
          {greeting}
        </Text>
        <Text variant="body" color={colors.mutedText} style={styles.subtitle}>
          {hydrated ? 'Welcome to Classroom 27.' : 'Loading your session...'}
        </Text>
        <View style={styles.actions}>
          {!isAuthenticated ? (
            <Button title="Sign in" onPress={() => router.push('/auth')} />
          ) : (
            <>
              <Button title="View profile" onPress={() => router.push('/profile')} style={styles.actionButton} />
              <Button title="Logout" onPress={() => authService.logout()} variant="secondary" />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
});
