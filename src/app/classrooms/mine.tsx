import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { BottomMenu } from '../../components/nav/BottomMenu';
import { ClassroomCard } from '../../components/classrooms/ClassroomCard';
import { Text } from '../../components/ui/Text';
import { classroomsService, Classroom } from '../../services/classrooms.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';

const bottomMenuHeight = 64;

export default function MyClassroomsScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setPendingAction = useAuthStore((state) => state.setPendingAction);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const requireAuth = useCallback(
    (action: () => void) => {
      setPendingAction(() => action);
      router.push('/auth');
    },
    [router, setPendingAction]
  );

  const loadClassrooms = useCallback(async () => {
    if (!accessToken) {
      setClassrooms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await classroomsService.getMine();
      setClassrooms(data);
    } catch {
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadClassrooms();
    }, [loadClassrooms])
  );

  useEffect(() => {
    if (!accessToken) {
      setPendingAction(() => () => router.replace('/classrooms/mine'));
      router.replace('/auth');
    }
  }, [accessToken, router, setPendingAction]);

  const handleDelete = useCallback(
    (classroomId: string) => {
      Alert.alert('Delete classroom?', 'This will remove the classroom from your list.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(classroomId);
            try {
              const success = await classroomsService.deleteClassroom(classroomId);
              if (success) {
                setClassrooms((prev) => prev.filter((item) => item.id !== classroomId));
              }
            } catch {
              Alert.alert('Delete failed', 'We were unable to delete this classroom.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]);
    },
    [setClassrooms]
  );

  const renderActions = (classroomId: string) => (
    <View style={styles.actions}>
      <Pressable style={[styles.actionButton, styles.updateButton]} onPress={() => router.push(`/classrooms/edit/${classroomId}`)}>
        <Text variant="small" weight="700" color={colors.textDark}>
          Update
        </Text>
      </Pressable>
      <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(classroomId)}>
        <Text variant="small" weight="700" color={colors.textDark}>
          Delete
        </Text>
      </Pressable>
    </View>
  );

  return (
    <Screen withHorizontalPadding={false}>
      <View style={styles.header}>
        <Text variant="h2" weight="700">
          My Classrooms
        </Text>
        <Text variant="body" color={colors.mutedText}>
          Swipe left to update or delete a classroom.
        </Text>
      </View>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={classrooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.listCard}>
                <Swipeable renderRightActions={() => renderActions(item.id)}>
                  <ClassroomCard classroom={item} onPress={() => router.push(`/classrooms/edit/${item.id}`)} />
                </Swipeable>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text variant="body" weight="600">
                  No classrooms yet.
                </Text>
                <Text variant="small" color={colors.mutedText} style={styles.emptySubtitle}>
                  Create your first classroom to see it here.
                </Text>
                <Pressable
                  style={styles.createCta}
                  onPress={() => {
                    if (accessToken) {
                      router.push('/classrooms/create');
                      return;
                    }
                    requireAuth(() => router.push('/classrooms/create'));
                  }}
                >
                  <Text weight="600" color={colors.textDark}>
                    Create a classroom
                  </Text>
                </Pressable>
              </View>
            }
          />
        )}
        {deletingId ? (
          <View style={styles.deletingOverlay}>
            <ActivityIndicator size="small" color={colors.textDark} />
            <Text variant="small" weight="600" color={colors.textDark}>
              Deleting classroom...
            </Text>
          </View>
        ) : null}
        <BottomMenu
          activeTab="mine"
          onPressHome={() => router.push('/')}
          onPressMine={() => router.push('/classrooms/mine')}
          onPressSettings={() =>
            accessToken ? router.push('/settings') : requireAuth(() => router.push('/settings'))
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2 + bottomMenuHeight,
  },
  listCard: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xl,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    minWidth: 90,
  },
  updateButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  emptyState: {
    paddingTop: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  createCta: {
    marginTop: spacing.sm,
    backgroundColor: colors.action,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  loading: {
    paddingTop: spacing.xl,
  },
  deletingOverlay: {
    position: 'absolute',
    top: spacing.xl * 3,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
});
