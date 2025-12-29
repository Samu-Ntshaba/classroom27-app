import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

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
import { userService } from '../services/user.service';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { getApiErrorMessage } from '../utils/error';
import { updateProfileSchema, UpdateProfileValues } from '../utils/validators';

export default function ProfileRoute() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);
  const mergeUser = useCallback(
    (incoming: any) => {
      if (!incoming) return;

      const current = useAuthStore.getState().user;

      if (current) {
        setUser({ ...current, ...incoming });
      } else {
        setUser(incoming);
      }
    },
    [setUser]
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? '' },
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

  useEffect(() => {
    if (!accessToken) {
      setPendingAction(() => () => router.replace('/profile'));
      router.replace('/auth');
      return;
    }
    loadProfile();
  }, [accessToken, loadProfile, router]);

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
        <Divider />
        <Text variant="h3" weight="700" style={styles.sectionTitle}>
          Edit profile
        </Text>
        <Controller
          control={profileForm.control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="Name" value={value} onChangeText={onChange} error={profileForm.formState.errors.name?.message} />
          )}
        />
        <Button title="Save profile" onPress={profileForm.handleSubmit(updateProfile)} style={styles.primaryButton} />
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
  sectionTitle: {
    marginBottom: spacing.sm,
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
