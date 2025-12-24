import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthTabs } from './AuthTabs';
import { LoginForm } from '../../features/auth/LoginForm';
import { RegisterForm } from '../../features/auth/RegisterForm';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { ModalCard } from '../ui/ModalCard';
import { Text } from '../ui/Text';
import { Logo } from '../ui/Logo';

export const AuthModal = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const router = useRouter();

  const closeModal = () => router.back();

  return (
    <View style={styles.overlay}>
      <ModalCard style={styles.card}>
        <View style={styles.header}>
          <Logo />
          <Pressable onPress={closeModal} hitSlop={10}>
            <Text weight="600" color={colors.mutedText}>
              Close
            </Text>
          </Pressable>
        </View>
        <AuthTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === 'login' ? (
          <LoginForm onSuccess={closeModal} />
        ) : (
          <RegisterForm onSuccess={() => setActiveTab('login')} />
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});
