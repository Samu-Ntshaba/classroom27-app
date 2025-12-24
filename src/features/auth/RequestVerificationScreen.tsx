import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';
import { emailSchema, EmailValues } from '../../utils/validators';

export const RequestVerificationScreen = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: EmailValues) => {
    setStatus(null);
    setError(null);
    setLoading(true);
    try {
      await authService.requestVerification(values);
      setStatus('Verification link sent. Check your email.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to send verification link.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text variant="h3" weight="700" style={styles.title}>
        Request Verification
      </Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
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
      <Button
        title={loading ? 'Sending...' : 'Send verification link'}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      />
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
