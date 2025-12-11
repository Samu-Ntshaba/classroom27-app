import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { brandColors, brandTypography } from '../../lib/branding';

interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact }: BrandLogoProps) {
  return (
    <View style={styles.logoRow}>
      <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
      {!compact && <Text style={styles.wordmark}>Classroom 27</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: brandColors.surface,
  },
  wordmark: {
    ...brandTypography.subtitle,
    color: brandColors.ink,
    letterSpacing: 0.5,
  },
});
