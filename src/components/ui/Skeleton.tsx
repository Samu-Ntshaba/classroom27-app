import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface SkeletonProps {
  style?: ViewStyle;
  radius?: number;
}

export const SkeletonBlock = ({ style, radius = 12 }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonAvatar = ({ style, radius = 20 }: SkeletonProps) => (
  <SkeletonBlock style={[styles.avatar, style]} radius={radius} />
);

export const SkeletonCard = ({ style, radius = 16 }: SkeletonProps) => (
  <View style={[styles.card, style]}>
    <SkeletonBlock style={styles.cardHeader} radius={radius} />
    <SkeletonBlock style={styles.cardLine} radius={radius} />
    <SkeletonBlock style={styles.cardLineShort} radius={radius} />
  </View>
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  cardHeader: {
    height: 140,
    borderRadius: 14,
  },
  cardLine: {
    height: 14,
    borderRadius: 10,
  },
  cardLineShort: {
    height: 14,
    width: '65%',
    borderRadius: 10,
  },
});
