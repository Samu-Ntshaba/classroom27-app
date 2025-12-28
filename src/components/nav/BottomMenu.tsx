import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Text } from '../ui/Text';

export type BottomMenuTab = 'home' | 'mine';

interface BottomMenuProps {
  activeTab: BottomMenuTab;
  onPressHome: () => void;
  onPressMine: () => void;
}

const tabs = [
  { key: 'home' as const, label: 'Home', icon: 'home-variant' },
  { key: 'mine' as const, label: 'My Classrooms', icon: 'book-account' },
];

export const BottomMenu = ({ activeTab, onPressHome, onPressMine }: BottomMenuProps) => {
  const handlers: Record<BottomMenuTab, () => void> = {
    home: onPressHome,
    mine: onPressMine,
  };

  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={handlers[tab.key]}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={24}
                color={isActive ? colors.primary : colors.mutedText}
              />
              <Text variant="tiny" weight="600" color={isActive ? colors.textDark : colors.mutedText}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.lg,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  menuItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
});
