import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';
import { notificationService, NotificationSettings } from '../../services/notification.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function SettingsNotificationsScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [settings, setSettings] = useState<NotificationSettings>({});
  const [savingSettings, setSavingSettings] = useState(false);

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
    loadSettings();
  }, [loadSettings]);

  const toggleSetting = async (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavingSettings(true);

    try {
      const response = await notificationService.updateSettings({ [key]: value });
      setSettings((prev) => ({ ...prev, ...response }));
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text variant="h2" weight="700">
            Notification management
          </Text>
          <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.smallButton} />
        </View>
        <Text variant="body" color={colors.mutedText} style={styles.subtitle}>
          Choose how you want to hear from Classroom 27.
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  smallButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
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
});
