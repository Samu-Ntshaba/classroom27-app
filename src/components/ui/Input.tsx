import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label ? (
        <Text variant="small" weight="600" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, style, error ? styles.inputError : null]}
        placeholderTextColor={colors.mutedText}
        {...props}
      />
      {error ? (
        <Text variant="tiny" color={colors.danger} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    marginTop: spacing.xs,
  },
});
