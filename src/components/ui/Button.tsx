import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
}: ButtonProps) => {
  const backgroundColor =
    variant === 'primary' ? colors.action : variant === 'secondary' ? colors.card : 'transparent';
  const borderColor = variant === 'secondary' ? colors.border : 'transparent';
  const textColor = variant === 'primary' ? colors.textDark : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      disabled={disabled}
    >
      <Text weight="600" color={textColor}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
});
