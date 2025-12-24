import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { userService, UserSummary } from '../../services/user.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { SkeletonBlock } from '../ui/Skeleton';
import { Text } from '../ui/Text';

interface SuggestedUsersRailProps {
  title?: string;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export const SuggestedUsersRail = ({ title = 'Suggested for you', onFollowChange }: SuggestedUsersRailProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getSuggested();
      setUsers(response);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFollowToggle = async (user: UserSummary) => {
    if (!accessToken) {
      return;
    }
    const nextFollowing = !user.isFollowing;
    setUsers((prev) =>
      prev.map((item) => (item.id === user.id ? { ...item, isFollowing: nextFollowing } : item))
    );
    onFollowChange?.(user.id, nextFollowing);
    try {
      if (nextFollowing) {
        await userService.followUser({ targetUserId: user.id });
      } else {
        await userService.unfollowUser(user.id);
      }
    } catch {
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, isFollowing: user.isFollowing } : item))
      );
      onFollowChange?.(user.id, user.isFollowing ?? false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="h3" weight="700" style={styles.title}>
        {title}
      </Text>
      <FlatList
        data={loading ? Array.from({ length: 4 }).map((_, index) => ({ id: `skeleton-${index}` })) : users}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        renderItem={({ item }) => {
          if (loading) {
            return (
              <View style={styles.card}>
                <SkeletonBlock style={styles.cardAvatar} radius={24} />
                <SkeletonBlock style={styles.cardLine} radius={10} />
                <SkeletonBlock style={styles.cardButton} radius={12} />
              </View>
            );
          }

          return (
            <Pressable style={styles.card}>
              <Avatar size={48} uri={item.avatarUrl} name={item.name} />
              <Text weight="600" numberOfLines={1}>
                {item.name ?? 'Student'}
              </Text>
              <Button
                title={item.isFollowing ? 'Following' : 'Follow'}
                variant={item.isFollowing ? 'secondary' : 'primary'}
                onPress={() => handleFollowToggle(item)}
                style={styles.followButton}
                disabled={!accessToken}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
  },
  rail: {
    gap: spacing.md,
  },
  card: {
    width: 140,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAvatar: {
    width: 48,
    height: 48,
  },
  cardLine: {
    width: 80,
    height: 12,
  },
  cardButton: {
    width: 90,
    height: 28,
  },
  followButton: {
    alignSelf: 'stretch',
    paddingVertical: spacing.sm,
  },
});
