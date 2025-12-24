import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';
import { verifyEmailSchema, VerifyEmailValues } from '../../utils/validators';

export const VerifyEmailScreen = () => {
  const params = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: params.token ?? '',
    },
  });

  const onSubmit = async (values: VerifyEmailValues) => {
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      await authService.verifyEmail({ token: values.token });
      setStatus('Email verified. You can now sign in.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to verify email.'));
    } finally {
      setLoading(false);
    }
  };

  const verifyFromLink = async () => {
    if (!params.token) return;
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      await authService.verifyEmailByQuery(params.token);
      setStatus('Email verified from link.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to verify email.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text variant="h3" weight="700" style={styles.title}>
        Verify Email
      </Text>
      {params.token ? (
        <Button title={loading ? 'Verifying...' : 'Verify from link'} onPress={verifyFromLink} disabled={loading} />
      ) : null}
      <Text variant="small" color={colors.mutedText} style={styles.subtitle}>
        Paste your verification token below if needed.
      </Text>
      <Controller
        control={control}
        name="token"
        render={({ field: { onChange, value } }) => (
          <Input label="Token" value={value} onChangeText={onChange} error={errors.token?.message} />
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
      <Button title={loading ? 'Verifying...' : 'Verify email'} onPress={handleSubmit(onSubmit)} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    marginVertical: spacing.sm,
  },
  status: {
    marginBottom: spacing.md,
  },
});
