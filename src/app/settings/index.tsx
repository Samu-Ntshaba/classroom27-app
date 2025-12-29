import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { BottomMenu } from '../../components/nav/BottomMenu';
import { Text } from '../../components/ui/Text';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

const bottomMenuHeight = 64;

export default function SettingsScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);

  const requireAuth = React.useCallback(
    (action: () => void) => {
      setPendingAction(() => action);
      router.push('/auth');
    },
    [router, setPendingAction]
  );

  useEffect(() => {
    if (!accessToken) {
      setPendingAction(() => () => router.replace('/settings'));
      router.replace('/auth');
    }
  }, [accessToken, router, setPendingAction]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h2" weight="700">
          Settings
        </Text>
        <Text variant="body" color={colors.mutedText}>
          Manage your account preferences.
        </Text>
      </View>
      <View style={styles.list}>
        <Pressable style={styles.card} onPress={() => router.push('/settings/password')}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="lock-outline" size={22} color={colors.textDark} />
          </View>
          <View style={styles.cardInfo}>
            <Text weight="700">Change Password</Text>
            <Text variant="small" color={colors.mutedText}>
              Update your login credentials.
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.mutedText} />
        </Pressable>
        <Pressable style={styles.card} onPress={() => router.push('/settings/notifications')}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textDark} />
          </View>
          <View style={styles.cardInfo}>
            <Text weight="700">Notification Management</Text>
            <Text variant="small" color={colors.mutedText}>
              Choose how we keep you updated.
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.mutedText} />
        </Pressable>
      </View>
      <BottomMenu
        activeTab="settings"
        onPressHome={() => router.push('/')}
        onPressMine={() => (accessToken ? router.push('/classrooms/mine') : requireAuth(() => router.push('/classrooms/mine')))}
        onPressSettings={() => router.push('/settings')}
      />
      <View style={styles.bottomSpacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xl * 2 + bottomMenuHeight,
  },
});
