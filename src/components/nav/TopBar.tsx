import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../ui/Logo';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../ui/Avatar';

interface TopBarProps {
  onPressSearch?: () => void;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  unreadCount?: number;
  avatarUrl?: string | null;
  userName?: string | null;
}

export const TopBar = ({
  onPressSearch,
  onPressNotifications,
  onPressProfile,
  unreadCount = 0,
  avatarUrl,
  userName,
}: TopBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <Logo width={132} height={28} />
      <View style={styles.actions}>
        <Pressable style={styles.iconButton} onPress={onPressSearch}>
          <Ionicons name="search-outline" size={20} color={colors.textDark} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onPressNotifications}>
          <Ionicons name="notifications-outline" size={20} color={colors.textDark} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
            </View>
          ) : null}
        </Pressable>
        <Pressable style={styles.avatarButton} onPress={onPressProfile}>
          <Avatar size={32} uri={avatarUrl ?? undefined} name={userName ?? undefined} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.card,
  },
});
