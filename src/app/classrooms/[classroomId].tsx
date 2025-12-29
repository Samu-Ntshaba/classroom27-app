import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Classroom, classroomsService } from '../../services/classrooms.service';
import { authStore, useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';
import { Screen } from '../../components/layout/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Text';

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' });
};

export default function ClassroomDetailsScreen() {
  const router = useRouter();
  const { classroomId } = useLocalSearchParams<{ classroomId: string }>();
  const setPendingAction = useAuthStore((state) => state.setPendingAction);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState<'publish' | 'go-live' | null>(null);

  const loadClassroom = useCallback(async () => {
    if (!classroomId) return;
    setLoading(true);
    try {
      const data = await classroomsService.getClassroom(classroomId);
      setClassroom(data);
    } catch (error) {
      Alert.alert('Unable to load classroom', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadClassroom();
  }, [loadClassroom]);

  const tags = useMemo(() => {
    if (!classroom) return [];
    const list: string[] = [];
    if (classroom.status?.toLowerCase() === 'live') list.push('Live');
    if (classroom.priceType) {
      const normalizedPriceType = classroom.priceType.toString().toUpperCase();
      list.push(
        normalizedPriceType === 'ONCE_OFF'
          ? 'One-time'
          : normalizedPriceType === 'SUBSCRIPTION'
            ? 'Subscription'
            : normalizedPriceType === 'PAID'
              ? 'Paid'
              : 'Free'
      );
    }
    return list;
  }, [classroom]);

  const toggleLike = async () => {
    if (!classroom) return;
    const token = authStore.getState().accessToken;
    if (!token) {
      setPendingAction(() => toggleLike);
      router.push('/auth');
      return;
    }
    const nextValue = !classroom.isLiked;
    setClassroom({ ...classroom, isLiked: nextValue });
    try {
      await classroomsService.toggleLike(classroom.id);
    } catch (error) {
      setClassroom({ ...classroom, isLiked: !nextValue });
      Alert.alert('Unable to update like', getApiErrorMessage(error));
    }
  };

  const toggleSave = async () => {
    if (!classroom) return;
    const token = authStore.getState().accessToken;
    if (!token) {
      setPendingAction(() => toggleSave);
      router.push('/auth');
      return;
    }
    const nextValue = !classroom.isSaved;
    setClassroom({ ...classroom, isSaved: nextValue });
    try {
      await classroomsService.toggleSave(classroom.id);
    } catch (error) {
      setClassroom({ ...classroom, isSaved: !nextValue });
      Alert.alert('Unable to update save', getApiErrorMessage(error));
    }
  };

  const handleSubscribe = async () => {
    if (!classroom) return;
    const token = authStore.getState().accessToken;
    if (!token) {
      setPendingAction(() => handleSubscribe);
      router.push('/auth');
      return;
    }
    setActionLoading(true);
    try {
      await classroomsService.subscribe(classroom.id);
      Alert.alert('You are in!', 'You have joined the classroom.');
    } catch (error) {
      Alert.alert('Unable to join classroom', getApiErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!classroom) return;
    const token = authStore.getState().accessToken;
    if (!token) {
      setPendingAction(() => handlePublish);
      router.push('/auth');
      return;
    }
    setWorkflowLoading('publish');
    try {
      const updated = await classroomsService.publishClassroom(classroom.id);
      setClassroom(updated ?? classroom);
      Alert.alert('Published', 'Your classroom is now published.');
    } catch (error) {
      Alert.alert('Unable to publish', getApiErrorMessage(error));
    } finally {
      setWorkflowLoading(null);
    }
  };

  const handleGoLive = async () => {
    if (!classroom) return;
    const token = authStore.getState().accessToken;
    if (!token) {
      setPendingAction(() => handleGoLive);
      router.push('/auth');
      return;
    }
    setWorkflowLoading('go-live');
    try {
      const updated = await classroomsService.goLiveClassroom(classroom.id);
      setClassroom(updated ?? classroom);
      Alert.alert('Live now', 'Your classroom is now live.');
    } catch (error) {
      Alert.alert('Unable to go live', getApiErrorMessage(error));
    } finally {
      setWorkflowLoading(null);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color={colors.mutedText}>
            Loading classroom...
          </Text>
        </View>
      </Screen>
    );
  }

  if (!classroom) {
    return (
      <Screen>
        <View style={styles.loading}>
          <Text variant="body">Classroom not found.</Text>
          <Button title="Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen withHorizontalPadding={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          {classroom.coverImageUrl ? (
            <Image source={{ uri: classroom.coverImageUrl }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text variant="body" weight="600" color={colors.mutedText}>
                Classroom 27
              </Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="h2" weight="700" style={styles.title}>
              {classroom.title}
            </Text>
            <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.backButton} />
          </View>
          {classroom.host?.name ? (
            <View style={styles.hostRow}>
              <Avatar uri={classroom.host?.avatarUrl} name={classroom.host?.name} size={36} />
              <View>
                <Text variant="small" weight="600">
                  {classroom.host?.name}
                </Text>
                <Text variant="tiny" color={colors.mutedText}>
                  Host
                </Text>
              </View>
            </View>
          ) : null}
          <View style={styles.pills}>
            {tags.map((pill) => (
              <View key={pill} style={styles.pill}>
                <Text variant="tiny" weight="600">
                  {pill}
                </Text>
              </View>
            ))}
          </View>
          {classroom.shortDescription ? (
            <Text variant="body" style={styles.sectionText}>
              {classroom.shortDescription}
            </Text>
          ) : null}
          <View style={styles.statusRow}>
            <Text variant="tiny" color={colors.mutedText}>
              Status
            </Text>
            <Text variant="small" weight="600">
              {classroom.status ?? 'Unknown'}
            </Text>
          </View>
          {classroom.fullDescription ? (
            <Text variant="body" color={colors.mutedText} style={styles.sectionText}>
              {classroom.fullDescription}
            </Text>
          ) : null}
          <View style={styles.metaGrid}>
            {classroom.startsAt ? (
              <View style={styles.metaItem}>
                <Text variant="tiny" color={colors.mutedText}>
                  Starts
                </Text>
                <Text variant="small" weight="600">
                  {formatDateTime(classroom.startsAt)}
                </Text>
              </View>
            ) : null}
            {classroom.endsAt ? (
              <View style={styles.metaItem}>
                <Text variant="tiny" color={colors.mutedText}>
                  Ends
                </Text>
                <Text variant="small" weight="600">
                  {formatDateTime(classroom.endsAt)}
                </Text>
              </View>
            ) : null}
            {classroom.maxSeats ? (
              <View style={styles.metaItem}>
                <Text variant="tiny" color={colors.mutedText}>
                  Seats
                </Text>
                <Text variant="small" weight="600">
                  {classroom.maxSeats}
                </Text>
              </View>
            ) : null}
            {classroom.priceType ? (
              <View style={styles.metaItem}>
                <Text variant="tiny" color={colors.mutedText}>
                  Price
                </Text>
                <Text variant="small" weight="600">
                  {classroom.priceType?.toString().toUpperCase() === 'FREE'
                    ? 'Free'
                    : classroom.priceType?.toString().toUpperCase() === 'SUBSCRIPTION'
                      ? `$${classroom.price ?? 0} / ${classroom.subscriptionType ?? 'subscription'}`
                      : `$${classroom.price ?? 0}`}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actionRow}>
            <Button
              title={classroom.isLiked ? 'Liked' : 'Like'}
              variant="secondary"
              onPress={toggleLike}
              style={styles.actionButton}
            />
            <Button
              title={classroom.isSaved ? 'Saved' : 'Save'}
              variant="secondary"
              onPress={toggleSave}
              style={styles.actionButton}
            />
          </View>
          {(classroom.canPublish || classroom.status?.toUpperCase() === 'DRAFT') && (
            <View style={styles.workflowRow}>
              <Button
                title={workflowLoading === 'publish' ? 'Publishing...' : 'Publish'}
                onPress={handlePublish}
                disabled={workflowLoading !== null}
                style={styles.actionButton}
              />
              {classroom.canGoLive ? (
                <Button
                  title={workflowLoading === 'go-live' ? 'Going live...' : 'Go live'}
                  onPress={handleGoLive}
                  disabled={workflowLoading !== null}
                  style={styles.actionButton}
                />
              ) : null}
            </View>
          )}
          {classroom.status?.toUpperCase() === 'LIVE' ? (
            <Button
              title={actionLoading ? 'Joining...' : 'Join live class'}
              onPress={handleSubscribe}
              disabled={actionLoading}
              style={styles.joinButton}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  cover: {
    height: 220,
    backgroundColor: colors.border,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  sectionText: {
    lineHeight: 22,
  },
  statusRow: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaItem: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  workflowRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  joinButton: {
    marginTop: spacing.sm,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
