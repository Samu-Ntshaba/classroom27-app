import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/layout/Screen';
import { TopBar } from '../components/nav/TopBar';
import { FeedSkeleton } from '../components/feed/FeedSkeleton';
import { HorizontalRailSkeleton } from '../components/feed/HorizontalRailSkeleton';
import { Text } from '../components/ui/Text';
import { notificationService } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const feedItems = Array.from({ length: 4 }).map((_, index) => ({ id: `feed-${index}` }));

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthenticated = Boolean(accessToken);

  const loadUnreadCount = useCallback(async () => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  useEffect(() => {
    if (hydrated) {
      loadUnreadCount();
    }
  }, [hydrated, loadUnreadCount]);

  return (
    <Screen withHorizontalPadding={false}>
      <TopBar
        onPressSearch={() => router.push('/search')}
        onPressNotifications={() => (isAuthenticated ? router.push('/notifications') : router.push('/auth'))}
        onPressProfile={() => (isAuthenticated ? router.push('/profile') : router.push('/auth'))}
        unreadCount={unreadCount}
        avatarUrl={user?.avatarUrl}
        userName={user?.name}
      />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <Text variant="h2" weight="700" style={styles.greeting}>
              {isAuthenticated ? `Welcome back, ${user?.name ?? 'Student'}` : 'Welcome to Classroom 27'}
            </Text>
            <Text variant="body" color={colors.mutedText} style={styles.subtitle}>
              {hydrated ? 'Discover what your classmates are sharing today.' : 'Loading your session...'}
            </Text>
            <View style={styles.section}>
              <Text variant="h3" weight="700" style={styles.sectionTitle}>
                Live now
              </Text>
              <HorizontalRailSkeleton />
            </View>
            <View style={styles.section}>
              <Text variant="h3" weight="700" style={styles.sectionTitle}>
                Trending
              </Text>
              <HorizontalRailSkeleton />
            </View>
            <Text variant="h3" weight="700" style={styles.sectionTitle}>
              Latest posts
            </Text>
          </View>
        }
        ListFooterComponent={<FeedSkeleton count={4} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    paddingBottom: spacing.lg,
  },
  greeting: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  subtitle: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
});
