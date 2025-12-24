import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { getApiErrorMessage } from '../../utils/error';
import { registerSchema, RegisterValues } from '../../utils/validators';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await authService.register({ name: values.name, email: values.email, password: values.password });
      setSuccess('Account created! Please log in.');
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create account.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
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

      {error ? (
        <Text variant="small" color={colors.danger} style={styles.status}>
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text variant="small" color={colors.success} style={styles.status}>
          {success}
        </Text>
      ) : null}

      <Pressable onPress={() => router.push('/auth/request-verification')}>
        <Text variant="small" color={colors.primary} style={styles.verifyLink}>
          Need to verify your email?
        </Text>
      </Pressable>

      <Button title={isLoading ? 'Creating...' : 'Create account'} onPress={handleSubmit(onSubmit)} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    marginBottom: spacing.sm,
  },
  verifyLink: {
    marginBottom: spacing.md,
  },
});
