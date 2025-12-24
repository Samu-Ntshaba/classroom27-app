import React, { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ScreenProps extends PropsWithChildren {
  style?: ViewStyle;
  withHorizontalPadding?: boolean;
}

export const Screen = ({ children, style, withHorizontalPadding = true }: ScreenProps) => {
  return (
    <SafeAreaView style={[styles.container, withHorizontalPadding && styles.padded, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
});
