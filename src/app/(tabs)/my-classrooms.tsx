import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { Classroom, classroomsService } from '../../services/classrooms.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { Screen } from '../../components/layout/Screen';
import { ClassroomCard } from '../../components/classrooms/ClassroomCard';
import { ClassroomCardSkeleton } from '../../components/classrooms/ClassroomCardSkeleton';
import { Text } from '../../components/ui/Text';

const listSkeletons = Array.from({ length: 4 }).map((_, index) => ({ id: `mine-${index}` }));

export default function MyClassroomsScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMine = useCallback(async () => {
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

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const handleDelete = (classroomId: string) => {
    Alert.alert('Delete classroom?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const previous = classrooms;
          setClassrooms((prev) => prev.filter((item) => item.id !== classroomId));
          try {
            await classroomsService.deleteClassroom(classroomId);
          } catch {
            setClassrooms(previous);
            Alert.alert('Unable to delete classroom');
          }
        },
      },
    ]);
  };

  const renderActions = (item: Classroom) => (
    <View style={styles.actions}>
      <Pressable
        style={[styles.actionButton, styles.actionUpdate]}
        onPress={() => router.push(`/classrooms/create?classroomId=${item.id}`)}
      >
        <Text variant="small" weight="600" color={colors.textDark}>
          Update
        </Text>
      </Pressable>
      <Pressable style={[styles.actionButton, styles.actionDelete]} onPress={() => handleDelete(item.id)}>
        <Text variant="small" weight="600" color={colors.card}>
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
        <Pressable onPress={() => router.push('/classrooms/create')} style={styles.createButton}>
          <Text weight="600" color={colors.textDark}>
            Create
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={classrooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <Swipeable renderRightActions={() => renderActions(item)}>
              <ClassroomCard classroom={item} onPress={() => router.push(`/classrooms/create?classroomId=${item.id}`)} />
            </Swipeable>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
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
              <Text variant="small" color={colors.mutedText}>
                Create your first classroom to get started.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  listCard: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  listSkeleton: {
    paddingTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    marginRight: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  actionUpdate: {
    backgroundColor: colors.primary,
  },
  actionDelete: {
    backgroundColor: colors.danger,
  },
});
