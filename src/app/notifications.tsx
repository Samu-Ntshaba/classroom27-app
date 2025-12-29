import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/layout/Screen';
import { Button } from '../components/ui/Button';
import { SkeletonBlock } from '../components/ui/Skeleton';
import { Text } from '../components/ui/Text';
import { notificationService, NotificationItem } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function NotificationsScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await notificationService.list();
      setNotifications(list);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setPendingAction(() => () => router.replace('/notifications'));
      router.replace('/auth');
      return;
    }
    loadNotifications();
  }, [accessToken, loadNotifications, router]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  useEffect(() => {
    if (!accessToken) return;
    const socket = notificationService.connectSocket(accessToken, {
      onNotification: (notification) => {
        setNotifications((prev) => {
          if (prev.some((item) => item.id === notification.id)) {
            return prev;
          }
          return [notification, ...prev];
        });
      },
      onClose: () => {
        loadNotifications();
      },
    });

    return () => socket.close();
  }, [accessToken, loadNotifications]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      loadNotifications();
    }
  };

  const markRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;
    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    );
    try {
      await notificationService.markRead(notification.id);
    } catch {
      loadNotifications();
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    markRead(notification);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="h2" weight="700">
          Notifications
        </Text>
        <Button title="Mark all read" variant="secondary" onPress={markAllRead} />
      </View>
      {loading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={`notification-${index}`} style={styles.skeletonCard} radius={16} />
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, item.isRead ? styles.cardRead : null]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.cardHeader}>
                <Text weight="600">{item.title ?? 'Classroom update'}</Text>
                {!item.isRead ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text variant="small" color={colors.mutedText}>
                {item.body ?? 'You have a new notification.'}
              </Text>
              {item.createdAt ? (
                <Text variant="tiny" color={colors.mutedText} style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              ) : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="body" color={colors.mutedText}>
                You&apos;re all caught up.
              </Text>
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardRead: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  timestamp: {
    marginTop: spacing.xs,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  skeletonList: {
    gap: spacing.md,
  },
  skeletonCard: {
    height: 90,
  },
});
