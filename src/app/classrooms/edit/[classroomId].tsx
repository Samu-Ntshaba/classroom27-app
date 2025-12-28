import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../../components/layout/Screen';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Text } from '../../../components/ui/Text';
import { classroomsService } from '../../../services/classrooms.service';
import { colors } from '../../../theme/colors';
import { radius } from '../../../theme/radius';
import { spacing } from '../../../theme/spacing';
import { getApiErrorMessage } from '../../../utils/error';

export default function EditClassroomScreen() {
  const router = useRouter();
  const { classroomId } = useLocalSearchParams<{ classroomId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const loadClassroom = async () => {
      if (!classroomId) return;
      setLoading(true);
      try {
        const data = await classroomsService.getClassroom(classroomId);
        if (!data) return;
        setTitle(data.title ?? '');
        setShortDescription(data.shortDescription ?? '');
        setSubject(data.subject ?? '');
        setTags(Array.isArray(data.tags) ? data.tags : []);
      } catch {
        Alert.alert('Unable to load classroom', 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadClassroom();
  }, [classroomId]);

  const canSave = useMemo(() => Boolean(title.trim()), [title]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  }, []);

  const handleSave = async () => {
    if (!classroomId) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        shortDescription: shortDescription.trim() || undefined,
        subject: subject.trim() || undefined,
        tags: tags.length ? tags : undefined,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      await classroomsService.updateClassroom(classroomId, payload);
      Alert.alert('Classroom updated', 'Your changes have been saved.');
      router.back();
    } catch (error) {
      Alert.alert('Unable to update classroom', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="h2" weight="700">
              Update classroom
            </Text>
            <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.backButton} />
          </View>
          <Text variant="small" color={colors.mutedText} style={styles.subtitle}>
            Update the details for your classroom.
          </Text>

          <Input label="Title *" placeholder="Classroom name" value={title} onChangeText={setTitle} />
          <Input
            label="Short description"
            placeholder="What will students learn?"
            value={shortDescription}
            onChangeText={setShortDescription}
          />
          <Input label="Subject" placeholder="Math, Music, Coding..." value={subject} onChangeText={setSubject} />
          <View style={styles.tagRow}>
            <Input
              label="Tags"
              placeholder="Add a tag and press add"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              style={styles.tagInput}
            />
            <Button title="Add" variant="secondary" onPress={addTag} style={styles.tagAdd} />
          </View>
          <View style={styles.tagsWrap}>
            {tags.map((tag) => (
              <Pressable key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                <Text variant="tiny" weight="600">
                  {tag} ×
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            title={saving ? 'Saving...' : 'Save updates'}
            onPress={handleSave}
            disabled={!canSave || saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  tagInput: {
    flex: 1,
  },
  tagAdd: {
    paddingHorizontal: spacing.lg,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tagChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
