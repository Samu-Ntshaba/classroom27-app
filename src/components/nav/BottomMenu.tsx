import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

export type BottomMenuTab = 'home' | 'mine' | 'settings';

interface BottomMenuProps {
  activeTab: BottomMenuTab;
  onPressHome: () => void;
  onPressMine: () => void;
  onPressSettings: () => void;
}

const tabs = [
  { key: 'home' as const, label: 'Home', icon: 'home-variant' },
  { key: 'mine' as const, label: 'My Classrooms', icon: 'book-account' },
  { key: 'settings' as const, label: 'Settings', icon: 'cog-outline' },
];

export const BottomMenu = ({ activeTab, onPressHome, onPressMine, onPressSettings }: BottomMenuProps) => {
  const handlers: Record<BottomMenuTab, () => void> = {
    home: onPressHome,
    mine: onPressMine,
    settings: onPressSettings,
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
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={26}
                color={isActive ? colors.primary : colors.mutedText}
              />
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
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
});
