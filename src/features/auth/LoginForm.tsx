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
import { loginSchema, LoginValues } from '../../utils/validators';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.login(values);
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to sign in.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
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
            secureTextEntry={!showPassword}
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Pressable onPress={() => setShowPassword((prev) => !prev)}>
        <Text variant="small" color={colors.primary} style={styles.link}>
          {showPassword ? 'Hide password' : 'Show password'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push('/auth/request-password-reset')}>
        <Text variant="small" color={colors.primary} style={styles.link}>
          Forgot your password?
        </Text>
      </Pressable>

      {error ? (
        <Text variant="small" color={colors.danger} style={styles.errorText}>
          {error}
        </Text>
      ) : null}

      <Button title={isLoading ? 'Signing in...' : 'Sign in'} onPress={handleSubmit(onSubmit)} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  link: {
    marginBottom: spacing.sm,
  },
  errorText: {
    marginVertical: spacing.sm,
  },
});
