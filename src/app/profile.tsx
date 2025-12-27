import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Controller, useForm } from 'react-hook-form';


import { Screen } from '../components/layout/Screen';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { SuggestedUsersRail } from '../components/profile/SuggestedUsersRail';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { Input } from '../components/ui/Input';
import { SkeletonBlock } from '../components/ui/Skeleton';
import { Text } from '../components/ui/Text';

import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../services/auth.service';
import { notificationService, NotificationSettings } from '../services/notification.service';
import { userService } from '../services/user.service';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { getApiErrorMessage } from '../utils/error';
import {
  changePasswordSchema,
  ChangePasswordValues,
  updateProfileSchema,
  UpdateProfileValues,
} from '../utils/validators';

export default function ProfileRoute() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile');

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    try {
      const me = await userService.getMe();
      setProfile(me);

      if (me?.name) {
        profileForm.setValue('name', me.name);
      }

      mergeUser(me);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load profile.'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, mergeUser, profileForm]);

  const loadSettings = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await notificationService.getSettings();
      setSettings(response);
    } catch {
      setSettings({});
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      router.replace('/auth');
      return;
    }
    loadProfile();
    loadSettings();
  }, [accessToken, loadProfile, loadSettings, router]);

  const updateProfile = async (values: UpdateProfileValues) => {
    if (!profile?.id) return;

    setStatusMessage(null);
    setError(null);

    try {
      const updated = await userService.updateProfile(profile.id, values);
      setProfile(updated);
      mergeUser(updated);
      setStatusMessage('Profile updated.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update profile.'));
    }
  };

  const changePassword = async (values: ChangePasswordValues) => {
    setStatusMessage(null);
    setError(null);

    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setStatusMessage('Password updated.');
      passwordForm.reset();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update password.'));
    }
  };

  const handleAvatarUpload = async () => {
    if (!profile?.id) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please enable photo permissions to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      base64: false,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    setStatusMessage(null);
    setError(null);

    try {
      const asset = result.assets[0];

      const file = {
        uri: asset.uri,
        name: asset.fileName ?? `avatar_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      };

      const updated = await userService.uploadAvatar(profile.id, file);

      setProfile(updated);
      mergeUser(updated);
      setStatusMessage('Avatar updated.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to upload avatar.'));
    }
  };

  const toggleSetting = async (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavingSettings(true);

    try {
      const response = await notificationService.updateSettings({ [key]: value });
      setSettings((prev) => ({ ...prev, ...response }));
    } catch {
      // revert if failed
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSavingSettings(false);
    }
  };

  const headerContent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingHeader}>
          <SkeletonBlock style={styles.skeletonAvatar} radius={36} />
          <View style={styles.skeletonText}>
            <SkeletonBlock style={styles.skeletonLine} radius={10} />
            <SkeletonBlock style={styles.skeletonLineShort} radius={10} />
          </View>
        </View>
      );
    }

    return (
      <ProfileHeader
        name={profile?.name ?? user?.name}
        email={profile?.email ?? user?.email}
        avatarUrl={profile?.avatarUrl ?? user?.avatarUrl}
        followers={profile?.followersCount ?? 0}
        following={profile?.followingCount ?? 0}
        onPressAvatar={handleAvatarUpload}
      />
    );
  }, [handleAvatarUpload, loading, profile, user]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text variant="h2" weight="700">
            Profile
          </Text>
          <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.smallButton} />
        </View>

        {headerContent}

        <View style={styles.headerActions}>
          <Button title="Upload avatar" variant="secondary" onPress={handleAvatarUpload} style={styles.smallButton} />
        </View>
        <View style={styles.tabBar}>
          <Button
            title="Profile"
            variant={activeTab === 'profile' ? 'primary' : 'secondary'}
            onPress={() => setActiveTab('profile')}
            style={styles.tabButton}
          />
          <Button
            title="Password"
            variant={activeTab === 'password' ? 'primary' : 'secondary'}
            onPress={() => setActiveTab('password')}
            style={styles.tabButton}
          />
          <Button
            title="Notifications"
            variant={activeTab === 'notifications' ? 'primary' : 'secondary'}
            onPress={() => setActiveTab('notifications')}
            style={styles.tabButton}
          />
        </View>
        {activeTab === 'profile' ? (
          <>
            <Divider />
            <Text variant="h3" weight="700" style={styles.sectionTitle}>
              Edit profile
            </Text>
            <Controller
              control={profileForm.control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Name"
                  value={value}
                  onChangeText={onChange}
                  error={profileForm.formState.errors.name?.message}
                />
              )}
            />
            <Button
              title="Save profile"
              onPress={profileForm.handleSubmit(updateProfile)}
              style={styles.primaryButton}
            />
            <Divider />
            <SuggestedUsersRail />
            {statusMessage ? (
              <Text variant="small" color={colors.success} style={styles.status}>
                {statusMessage}
              </Text>
            ) : null}
            {error ? (
              <Text variant="small" color={colors.danger} style={styles.status}>
                {error}
              </Text>
            ) : null}
            <View style={styles.logout}>
              <Button title="Logout" variant="secondary" onPress={() => authService.logout()} style={styles.smallButton} />
            </View>
          </>
        ) : null}
        {activeTab === 'password' ? (
          <>
            <Divider />
            <Text variant="h3" weight="700" style={styles.sectionTitle}>
              Change password
            </Text>
            <Controller
              control={passwordForm.control}
              name="currentPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Current password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={passwordForm.formState.errors.currentPassword?.message}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="New password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={passwordForm.formState.errors.newPassword?.message}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm new password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
              )}
            />
            <Button
              title="Update password"
              onPress={passwordForm.handleSubmit(changePassword)}
              style={styles.primaryButton}
            />
            {statusMessage ? (
              <Text variant="small" color={colors.success} style={styles.status}>
                {statusMessage}
              </Text>
            ) : null}
            {error ? (
              <Text variant="small" color={colors.danger} style={styles.status}>
                {error}
              </Text>
            ) : null}
          </>
        ) : null}
        {activeTab === 'notifications' ? (
          <>
            <Divider />
            <Text variant="h3" weight="700" style={styles.sectionTitle}>
              Notification settings
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text weight="600">Email on follow</Text>
                <Text variant="small" color={colors.mutedText}>
                  Receive an email when someone follows you.
                </Text>
              </View>
              <Switch
                value={Boolean(settings.emailOnFollow)}
                onValueChange={(value) => toggleSetting('emailOnFollow', value)}
                thumbColor={colors.card}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={savingSettings}
                style={styles.switch}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text weight="600">Email on chat request</Text>
                <Text variant="small" color={colors.mutedText}>
                  Get notified when someone requests a chat.
                </Text>
              </View>
              <Switch
                value={Boolean(settings.emailOnChatRequest)}
                onValueChange={(value) => toggleSetting('emailOnChatRequest', value)}
                thumbColor={colors.card}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={savingSettings}
                style={styles.switch}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text weight="600">Email on chat request accepted</Text>
                <Text variant="small" color={colors.mutedText}>
                  Receive updates when a chat request is accepted.
                </Text>
              </View>
              <Switch
                value={Boolean(settings.emailOnChatRequestAccepted)}
                onValueChange={(value) => toggleSetting('emailOnChatRequestAccepted', value)}
                thumbColor={colors.card}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={savingSettings}
                style={styles.switch}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text weight="600">Email on likes</Text>
                <Text variant="small" color={colors.mutedText}>
                  Receive emails when someone likes your content.
                </Text>
              </View>
              <Switch
                value={Boolean(settings.emailOnLike)}
                onValueChange={(value) => toggleSetting('emailOnLike', value)}
                thumbColor={colors.card}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={savingSettings}
                style={styles.switch}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text weight="600">Email on comments</Text>
                <Text variant="small" color={colors.mutedText}>
                  Receive emails when someone comments on your content.
                </Text>
              </View>
              <Switch
                value={Boolean(settings.emailOnComment)}
                onValueChange={(value) => toggleSetting('emailOnComment', value)}
                thumbColor={colors.card}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={savingSettings}
                style={styles.switch}
              />
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text weight="600">Email on messages</Text>
                <Text variant="small" color={colors.mutedText}>
                  Receive emails for new messages.
                </Text>
              </View>
              <Switch
                value={Boolean(settings.emailOnMessage)}
                onValueChange={(value) => toggleSetting('emailOnMessage', value)}
                thumbColor={colors.card}
                trackColor={{ false: colors.border, true: colors.primary }}
                disabled={savingSettings}
                style={styles.switch}
              />
            </View>
            {statusMessage ? (
              <Text variant="small" color={colors.success} style={styles.status}>
                {statusMessage}
              </Text>
            ) : null}
            {error ? (
              <Text variant="small" color={colors.danger} style={styles.status}>
                {error}
              </Text>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerActions: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  settingInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  status: {
    marginTop: spacing.sm,
  },
  logout: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  smallButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    alignSelf: 'flex-start',
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  skeletonAvatar: {
    width: 72,
    height: 72,
  },
  skeletonText: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonLine: {
    height: 18,
    width: '80%',
  },
  skeletonLineShort: {
    height: 14,
    width: '50%',
  },
});
