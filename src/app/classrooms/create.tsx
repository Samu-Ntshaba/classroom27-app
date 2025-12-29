import React, { useMemo, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { classroomsService, CreateClassroomPayload } from '../../services/classrooms.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';

type PriceType = 'FREE' | 'ONCE_OFF' | 'SUBSCRIPTION';

type CreateClassroomFormValues = {
  title: string;
  shortDescription: string;
  tags: string[];
  coverImageUrl: string;
  priceType: PriceType;
  price: string;
  subscriptionType: string;
  startsAt: string;
  endsAt: string;
  frequency: string;
  maxSeats: string;
};

const FREQUENCY_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly'];

const parseDateValue = (value: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const buildCreatePayload = (values: CreateClassroomFormValues): CreateClassroomPayload => {
  const payload: CreateClassroomPayload = {
    title: values.title.trim(),
    priceType: values.priceType,
  };

  const shortDescription = values.shortDescription.trim();
  if (shortDescription) {
    payload.shortDescription = shortDescription;
  }

  if (values.tags.length) {
    payload.tags = values.tags;
  }

  if (values.coverImageUrl) {
    payload.coverImageUrl = values.coverImageUrl;
  }

  const startsAt = parseDateValue(values.startsAt);
  if (startsAt) {
    payload.startsAt = startsAt;
  }

  const endsAt = parseDateValue(values.endsAt);
  if (endsAt) {
    payload.endsAt = endsAt;
  }

  if (values.frequency) {
    payload.frequency = values.frequency;
  }

  if (values.maxSeats) {
    payload.maxSeats = Number(values.maxSeats);
  }

  if (values.priceType !== 'FREE' && values.price) {
    payload.price = Number(values.price);
  }

  if (values.priceType === 'SUBSCRIPTION' && values.subscriptionType.trim()) {
    payload.subscriptionType = values.subscriptionType.trim();
  }

  return payload;
};

export default function CreateClassroomScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [frequency, setFrequency] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('FREE');
  const [price, setPrice] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (priceType !== 'FREE') {
      return Boolean(price) && Number(price) > 0;
    }
    return true;
  }, [price, priceType, title]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handlePickImage = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please enable access to upload a cover image.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.85,
          });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      setUploadingCover(true);
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.fileName ?? `classroom_${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      };
      const url = await classroomsService.uploadCover(file);
      if (typeof url === 'string') {
        setCoverImageUrl(url);
      } else if (url?.url) {
        setCoverImageUrl(url.url);
      }
    } catch (error) {
      Alert.alert('Upload failed', getApiErrorMessage(error, 'Unable to upload cover image.'));
    } finally {
      setUploadingCover(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add cover image', 'Choose a source', [
      { text: 'Camera', onPress: () => handlePickImage('camera') },
      { text: 'Photo Library', onPress: () => handlePickImage('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    try {
      const payload = buildCreatePayload({
        title,
        shortDescription,
        tags,
        coverImageUrl,
        priceType,
        price,
        subscriptionType,
        startsAt,
        endsAt,
        frequency,
        maxSeats,
      });

      const created = await classroomsService.createClassroom(payload);
      Alert.alert('Classroom created', 'Your classroom is ready for review.');
      if (created?.id) {
        router.replace(`/classrooms/${created.id}`);
      } else {
        router.replace('/');
      }
    } catch (error) {
      Alert.alert('Unable to create classroom', getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="h2" weight="700">
              Create classroom
            </Text>
            <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.backButton} />
          </View>

          <View>
            <Text variant="small" weight="600" style={styles.sectionLabel}>
              Basics
            </Text>
            <Input label="Title *" placeholder="Give this classroom a name" value={title} onChangeText={setTitle} />
            <Input
              label="Short description"
              placeholder="What will students learn?"
              value={shortDescription}
              onChangeText={setShortDescription}
            />
            <View style={styles.tagRow}>
              <Input
                label="Tags"
                placeholder="Add a tag and press add"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                style={styles.tagInput}
              />
              <Pressable style={styles.tagAdd} onPress={addTag}>
                <Text weight="600" color={colors.textDark}>
                  Add
                </Text>
              </Pressable>
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
          </View>

          <View style={styles.sectionSpacing}>
            <Text variant="small" weight="600" style={styles.sectionLabel}>
              Cover image
            </Text>
            <Pressable style={styles.coverButton} onPress={showImageOptions} disabled={uploadingCover}>
              {uploadingCover ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text variant="small" weight="600">
                  {coverImageUrl ? 'Replace cover image' : 'Upload cover image'}
                </Text>
              )}
            </Pressable>
            {coverImageUrl ? (
              <Text variant="tiny" color={colors.mutedText}>
                Uploaded ✅
              </Text>
            ) : null}
          </View>

          <View style={styles.sectionSpacing}>
            <Text variant="small" weight="600" style={styles.sectionLabel}>
              Pricing
            </Text>
            <View style={styles.segmentedRow}>
              {(['FREE', 'ONCE_OFF', 'SUBSCRIPTION'] as PriceType[]).map((option) => {
                const active = priceType === option;
                return (
                  <Pressable
                    key={option}
                    style={[styles.segmentedButton, active && styles.segmentedButtonActive]}
                    onPress={() => setPriceType(option)}
                  >
                    <Text variant="small" weight="600" color={active ? colors.textDark : colors.mutedText}>
                      {option === 'FREE' ? 'Free' : option === 'ONCE_OFF' ? 'One-time' : 'Subscription'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {priceType !== 'FREE' ? (
              <Input
                label="Price"
                placeholder="Enter amount"
                keyboardType="number-pad"
                value={price}
                onChangeText={setPrice}
              />
            ) : null}
            {priceType === 'SUBSCRIPTION' ? (
              <Input
                label="Subscription type (optional)"
                placeholder="Monthly, yearly..."
                value={subscriptionType}
                onChangeText={setSubscriptionType}
              />
            ) : null}
          </View>

          <View style={styles.sectionSpacing}>
            <Pressable style={styles.accordionHeader} onPress={() => setAdvancedOpen((prev) => !prev)}>
              <Text variant="small" weight="600">
                Advanced options
              </Text>
              <Text variant="small" color={colors.mutedText}>
                {advancedOpen ? 'Hide' : 'Show'}
              </Text>
            </Pressable>
            {advancedOpen ? (
              <View style={styles.accordionBody}>
                <Input
                  label="Starts at"
                  placeholder="YYYY-MM-DD HH:mm"
                  value={startsAt}
                  onChangeText={setStartsAt}
                />
                <Input label="Ends at" placeholder="YYYY-MM-DD HH:mm" value={endsAt} onChangeText={setEndsAt} />
                <Text variant="small" weight="600" style={styles.sectionLabel}>
                  Frequency
                </Text>
                <View style={styles.frequencyRow}>
                  {FREQUENCY_OPTIONS.map((option) => {
                    const active = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.frequencyChip, active && styles.frequencyChipActive]}
                        onPress={() => setFrequency(active ? '' : option)}
                      >
                        <Text variant="small" weight="600" color={active ? colors.textDark : colors.mutedText}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Input
                  label="Max seats"
                  placeholder="e.g. 30"
                  keyboardType="number-pad"
                  value={maxSeats}
                  onChangeText={setMaxSeats}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={submitting ? 'Creating...' : 'Create classroom'}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  sectionSpacing: {
    marginTop: spacing.lg,
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
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tagChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  coverButton: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  frequencyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  frequencyChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  segmentedButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accordionBody: {
    paddingTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: spacing.md,
  },
});
