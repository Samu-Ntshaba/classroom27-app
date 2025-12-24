import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';
import { resetPasswordSchema, ResetPasswordValues } from '../../utils/validators';

export const ResetPasswordScreen = () => {
  const params = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: params.token ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword({ token: values.token, password: values.password });
      setStatus('Password updated. You can now sign in.');
      setTimeout(() => {
        router.replace('/auth');
      }, 800);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text variant="h3" weight="700" style={styles.title}>
        Set a new password
      </Text>
      <Controller
        control={control}
        name="token"
        render={({ field: { onChange, value } }) => (
          <Input label="Token" value={value} onChangeText={onChange} error={errors.token?.message} />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="New Password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Confirm Password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      {status ? (
        <Text variant="small" color={colors.success} style={styles.status}>
          {status}
        </Text>
      ) : null}
      {error ? (
        <Text variant="small" color={colors.danger} style={styles.status}>
          {error}
        </Text>
      ) : null}
      <Button title={loading ? 'Saving...' : 'Update password'} onPress={handleSubmit(onSubmit)} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
  status: {
    marginBottom: spacing.md,
  },
});
