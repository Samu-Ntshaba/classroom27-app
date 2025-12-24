import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface AppTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'tiny';
  color?: string;
  weight?: '400' | '500' | '600' | '700';
}

export const Text = ({
  variant = 'body',
  color = colors.text,
  weight = '400',
  style,
  ...props
}: AppTextProps) => {
  return (
    <RNText
      style={[styles.base, { color, fontSize: typography[variant], fontWeight: weight }, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});
