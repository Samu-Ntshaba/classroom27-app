import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';
import { changePasswordSchema, ChangePasswordValues } from '../../utils/validators';

export default function SettingsPasswordScreen() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const changePassword = async (values: ChangePasswordValues) => {
    setStatusMessage(null);
    setError(null);

    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setStatusMessage('Password updated.');
      passwordForm.reset();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update password.'));
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text variant="h2" weight="700">
            Change password
          </Text>
          <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.smallButton} />
        </View>
        <Text variant="body" color={colors.mutedText} style={styles.subtitle}>
          Keep your account secure with a strong password.
        </Text>

        <Controller
          control={passwordForm.control}
          name="currentPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Current password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
          )}
        />
        <Controller
          control={passwordForm.control}
          name="newPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="New password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={passwordForm.formState.errors.newPassword?.message}
            />
          )}
        />
        <Controller
          control={passwordForm.control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm new password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />
          )}
        />
        <Button title="Update password" onPress={passwordForm.handleSubmit(changePassword)} style={styles.primaryButton} />
        {statusMessage ? (
          <Text variant="small" color={colors.success} style={styles.status}>
            {statusMessage}
          </Text>
        ) : null}
        {error ? (
          <Text variant="small" color={colors.danger} style={styles.status}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  smallButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    alignSelf: 'flex-start',
  },
  status: {
    marginTop: spacing.sm,
  },
});
