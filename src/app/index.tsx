import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/layout/Screen';
import { TopBar } from '../components/nav/TopBar';
import { BottomMenu } from '../components/nav/BottomMenu';
import { ClassroomCard } from '../components/classrooms/ClassroomCard';
import { ClassroomCardSkeleton } from '../components/classrooms/ClassroomCardSkeleton';
import { Text } from '../components/ui/Text';
import { classroomsService, Classroom } from '../services/classrooms.service';
import { notificationService } from '../services/notification.service';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const railSkeletons = Array.from({ length: 4 }).map((_, index) => ({ id: `rail-${index}` }));
const listSkeletons = Array.from({ length: 4 }).map((_, index) => ({ id: `list-${index}` }));
const bottomMenuHeight = 76;

const FILTERS = [
  { key: 'latest', label: 'For you' },
  { key: 'live', label: 'Live' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
  { key: '1on1', label: '1-on-1' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveClasses, setLiveClasses] = useState<Classroom[]>([]);
  const [trendingClasses, setTrendingClasses] = useState<Classroom[]>([]);
  const [feedClasses, setFeedClasses] = useState<Classroom[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('latest');

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

  const loadLive = useCallback(async () => {
    setLiveLoading(true);
    try {
      const data = await classroomsService.listClassrooms({ type: 'live' });
      setLiveClasses(data);
    } catch {
      setLiveClasses([]);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const data = await classroomsService.listClassrooms({ type: 'trending' });
      setTrendingClasses(data);
    } catch {
      setTrendingClasses([]);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  const loadFeed = useCallback(async (filter: string) => {
    setFeedLoading(true);
    try {
      const data = await classroomsService.listClassrooms({ type: filter });
      setFeedClasses(data);
    } catch {
      setFeedClasses([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
      loadLive();
      loadTrending();
      loadFeed(activeFilter);
    }, [activeFilter, loadFeed, loadLive, loadTrending, loadUnreadCount])
  );

  useEffect(() => {
    if (hydrated) {
      loadUnreadCount();
    }
  }, [hydrated, loadUnreadCount]);

  useEffect(() => {
    loadFeed(activeFilter);
  }, [activeFilter, loadFeed]);

  useEffect(() => {
    if (!accessToken) return;
    const socket = notificationService.connectSocket(accessToken, {
      onUnreadCount: (count) => setUnreadCount(count),
      onNotification: () => setUnreadCount((prev) => prev + 1),
      onClose: () => {
        loadUnreadCount();
      },
    });

    return () => socket.close();
  }, [accessToken, loadUnreadCount]);

  const renderRail = (items: Classroom[], loading: boolean) => {
    if (loading) {
      return (
        <FlatList
          horizontal
          data={railSkeletons}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          renderItem={() => <ClassroomCardSkeleton variant="rail" />}
        />
      );
    }

    if (!items.length) {
      return (
        <View style={styles.emptyRail}>
          <Text variant="small" color={colors.mutedText}>
            No classrooms yet.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        renderItem={({ item }) => (
          <ClassroomCard
            classroom={item}
            variant="rail"
            onPress={() => router.push(`/classrooms/${item.id}`)}
          />
        )}
      />
    );
  };

  const headerContent = useMemo(
    () => (
      <View style={styles.headerContent}>
        <Text variant="h2" weight="700" style={styles.greeting}>
          {isAuthenticated ? `Welcome back, ${user?.name ?? 'Student'}` : 'Welcome to Classroom 27'}
        </Text>
        <Text variant="body" color={colors.mutedText} style={styles.subtitle}>
          {hydrated ? 'Discover what your classmates are sharing today.' : 'Loading your session...'}
        </Text>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" weight="700" style={styles.sectionTitle}>
              Live now
            </Text>
            {liveLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
          {renderRail(liveClasses, liveLoading)}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" weight="700" style={styles.sectionTitle}>
              Trending
            </Text>
            {trendingLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
          {renderRail(trendingClasses, trendingLoading)}
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;
            return (
              <Pressable
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text variant="small" weight="600" color={isActive ? colors.textDark : colors.mutedText}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
          {feedLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        </View>
        <Text variant="h3" weight="700" style={styles.sectionTitle}>
          Latest classrooms
        </Text>
      </View>
    ),
    [
      activeFilter,
      feedLoading,
      hydrated,
      isAuthenticated,
      liveClasses,
      liveLoading,
      trendingClasses,
      trendingLoading,
      user?.name,
    ]
  );

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
      <View style={styles.container}>
        <FlatList
          data={feedClasses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listCard}>
              <ClassroomCard classroom={item} onPress={() => router.push(`/classrooms/${item.id}`)} />
            </View>
          )}
          ListHeaderComponent={headerContent}
          ListEmptyComponent={
            feedLoading ? (
              <View style={styles.listSkeleton}>
                {listSkeletons.map((item) => (
                  <View key={item.id} style={styles.listCard}>
                    <ClassroomCardSkeleton />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text variant="body" weight="600">
                  No classrooms yet.
                </Text>
                <Text variant="small" color={colors.mutedText} style={styles.emptySubtitle}>
                  Create the first one and invite your classmates.
                </Text>
                <Pressable style={styles.emptyCta} onPress={() => router.push('/classrooms/create')}>
                  <Text weight="600" color={colors.textDark}>
                    Create a classroom
                  </Text>
                </Pressable>
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        <Pressable style={styles.fab} onPress={() => router.push('/classrooms/create')}>
          <Text variant="h3" weight="700" color={colors.textDark}>
            +
          </Text>
        </Pressable>
        <BottomMenu
          activeTab="home"
          onPressHome={() => router.push('/')}
          onPressMine={() => router.push('/classrooms/mine')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  rail: {
    paddingHorizontal: spacing.xl,
  },
  emptyRail: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  listContent: {
    paddingBottom: spacing.xl * 2 + bottomMenuHeight,
  },
  listCard: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  listSkeleton: {
    paddingTop: spacing.md,
  },
  emptyState: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl + bottomMenuHeight,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
});
