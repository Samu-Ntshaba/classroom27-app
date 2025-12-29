import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { BRAND_LOGO } from '../../constants/branding';

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo = ({ width = 280, height = 42 }: LogoProps) => (
  <Image source={BRAND_LOGO} resizeMode="contain" style={[styles.logo, { width, height }]} />
);

const styles = StyleSheet.create({
  logo: {
    height: 42,
  },
});
