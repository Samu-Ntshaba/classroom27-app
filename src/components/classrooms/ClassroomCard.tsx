import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Classroom } from '../../services/classrooms.service';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';

interface ClassroomCardProps {
  classroom: Classroom;
  variant?: 'rail' | 'list';
  onPress?: () => void;
  onPressCta?: () => void;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const ClassroomCard = ({ classroom, variant = 'list', onPress, onPressCta }: ClassroomCardProps) => {
  const cover = classroom.coverImageUrl;
  const formattedStart = formatDateTime(classroom.startsAt);
  const normalizedPriceType = classroom.priceType?.toString().toUpperCase();
  const priceLabel =
    normalizedPriceType === 'ONCE_OFF' || normalizedPriceType === 'PAID'
      ? 'Paid'
      : normalizedPriceType === 'SUBSCRIPTION'
        ? 'Subscription'
        : 'Free';
  const isLive = classroom.status?.toString().toLowerCase() === 'live' || classroom.isAlwaysLiveDemo;
  const isOneOnOne = classroom.maxSeats === 1 || classroom.tags?.includes('1on1') || classroom.tags?.includes('1-on-1');

  const pills = useMemo(() => {
    const list: string[] = [];
    if (isLive) list.push('Live');
    list.push(priceLabel);
    if (isOneOnOne) list.push('1-on-1');
    return list;
  }, [isLive, isOneOnOne, priceLabel]);

  return (
    <Pressable onPress={onPress} style={[styles.card, variant === 'rail' && styles.cardRail]}>
      <View style={styles.cover}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text variant="small" weight="600" color={colors.mutedText}>
              Classroom 27
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text variant="body" weight="600" numberOfLines={2} style={styles.title}>
          {classroom.title}
        </Text>
        {classroom.host?.name ? (
          <View style={styles.hostRow}>
            <Avatar uri={classroom.host?.avatarUrl} name={classroom.host?.name} size={24} />
            <Text variant="small" color={colors.mutedText} numberOfLines={1}>
              {classroom.host?.name}
            </Text>
          </View>
        ) : null}
        <View style={styles.pills}>
          {pills.map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text variant="tiny" weight="600" color={colors.textDark}>
                {pill}
              </Text>
            </View>
          ))}
          {formattedStart ? (
            <View style={styles.startBadge}>
              <Text variant="tiny" color={colors.mutedText}>
                Starts {formattedStart}
              </Text>
            </View>
          ) : null}
        </View>
        {variant === 'list' ? (
          <Button
            title={isLive ? 'Join' : 'View'}
            onPress={onPressCta ?? onPress ?? (() => undefined)}
            style={styles.cta}
          />
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardRail: {
    width: 220,
    marginRight: spacing.md,
  },
  cover: {
    height: 120,
    backgroundColor: colors.border,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  startBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cta: {
    marginTop: spacing.sm,
  },
});
