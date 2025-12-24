import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ProfileScreen } from '../features/auth/ProfileScreen';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function ProfileRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo />
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
      <View style={styles.content}>
        <ProfileScreen />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});
