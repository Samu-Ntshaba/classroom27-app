import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Text } from '../ui/Text';

interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onChange: (tab: 'login' | 'register') => void;
}

export const AuthTabs = ({ activeTab, onChange }: AuthTabsProps) => {
  return (
    <View style={styles.container}>
      {(['login', 'register'] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tab, isActive ? styles.activeTab : null]}
          >
            <Text weight="600" color={isActive ? colors.textDark : colors.mutedText}>
              {tab === 'login' ? 'Login' : 'Register'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  activeTab: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});
