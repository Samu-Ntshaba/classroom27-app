import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { Text } from './Text';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  style?: ViewStyle;
}

const getInitials = (name?: string | null) => {
  if (!name) return 'C';
  const parts = name.trim().split(' ');
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join('') || 'C';
};

export const Avatar = ({ uri, name, size = 40, style }: AvatarProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text weight="600" color={colors.textDark}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
