import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { Text } from '../../../components/ui/Text';

interface LiveTopBarProps {
  title: string;
  participantCount: number;
  onPressBack: () => void;
}

export const LiveTopBar = ({ title, participantCount, onPressBack }: LiveTopBarProps) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPressBack} hitSlop={10} style={styles.backButton}>
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
      </Pressable>
      <View style={styles.titleBlock}>
        <Text weight="700" color={colors.card}>
          {title}
        </Text>
        <Text variant="small" color={colors.card}>
          {participantCount} watching
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'rgba(15, 22, 42, 0.55)',
    borderRadius: 16,
  },
  backButton: {
    padding: spacing.xs,
  },
  titleBlock: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
