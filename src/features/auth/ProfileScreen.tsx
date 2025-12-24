import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';
import { changePasswordSchema, ChangePasswordValues, updateProfileSchema, UpdateProfileValues } from '../../utils/validators';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const updateProfile = async (values: UpdateProfileValues) => {
    setProfileStatus(null);
    setError(null);
    try {
      await authService.updateMe(values);
      setProfileStatus('Profile updated.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update profile.'));
    }
  };

  const changePassword = async (values: ChangePasswordValues) => {
    setPasswordStatus(null);
    setError(null);
    try {
      await authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setPasswordStatus('Password updated.');
      passwordForm.reset();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update password.'));
    }
  };

  return (
    <View>
      <Text variant="h3" weight="700" style={styles.title}>
        Profile
      </Text>
      <Text variant="small" color={colors.mutedText}>
        {user?.email ?? 'No email on file'}
      </Text>
      <Divider />
      <Controller
        control={profileForm.control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Name"
            value={value}
            onChangeText={onChange}
            error={profileForm.formState.errors.name?.message}
          />
        )}
      />
      <Button title="Save profile" onPress={profileForm.handleSubmit(updateProfile)} />
      {profileStatus ? (
        <Text variant="small" color={colors.success} style={styles.status}>
          {profileStatus}
        </Text>
      ) : null}

      <Divider />
      <Text variant="h3" weight="700" style={styles.subtitle}>
        Change password
      </Text>
      <Controller
        control={passwordForm.control}
        name="currentPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Current Password"
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
            label="New Password"
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
            label="Confirm New Password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={passwordForm.formState.errors.confirmPassword?.message}
          />
        )}
      />
      <Button title="Update password" onPress={passwordForm.handleSubmit(changePassword)} />
      {passwordStatus ? (
        <Text variant="small" color={colors.success} style={styles.status}>
          {passwordStatus}
        </Text>
      ) : null}
      {error ? (
        <Text variant="small" color={colors.danger} style={styles.status}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  status: {
    marginTop: spacing.sm,
  },
});
