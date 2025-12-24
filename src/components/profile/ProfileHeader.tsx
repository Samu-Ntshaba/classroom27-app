import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ProfileHeaderProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  followers?: number;
  following?: number;
  onPressAvatar?: () => void;
}

export const ProfileHeader = ({
  name,
  email,
  avatarUrl,
  followers = 0,
  following = 0,
  onPressAvatar,
}: ProfileHeaderProps) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPressAvatar} disabled={!onPressAvatar}>
        <Avatar size={72} uri={avatarUrl ?? undefined} name={name ?? undefined} />
      </Pressable>
      <View style={styles.info}>
        <Text variant="h2" weight="700">
          {name ?? 'Classroom Learner'}
        </Text>
        <Text variant="small" color={colors.mutedText}>
          {email ?? 'No email on file'}
        </Text>
        <View style={styles.counts}>
          <View style={styles.countItem}>
            <Text weight="700">{followers}</Text>
            <Text variant="small" color={colors.mutedText}>
              Followers
            </Text>
          </View>
          <View style={styles.countItem}>
            <Text weight="700">{following}</Text>
            <Text variant="small" color={colors.mutedText}>
              Following
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  counts: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  countItem: {
    gap: spacing.xs,
  },
});
