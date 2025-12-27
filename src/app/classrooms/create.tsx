import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Text } from '../../components/ui/Text';
import { classroomsService } from '../../services/classrooms.service';
import { useAuthStore } from '../../store/auth.store';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { getApiErrorMessage } from '../../utils/error';

type PriceType = 'free' | 'paid';

const FREQUENCY_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly'];

export default function CreateClassroomScreen() {
  const router = useRouter();
  const { classroomId } = useLocalSearchParams<{ classroomId?: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isAlwaysLiveDemo, setIsAlwaysLiveDemo] = useState(false);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [frequency, setFrequency] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [minAge, setMinAge] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('free');
  const [price, setPrice] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingClassroom, setLoadingClassroom] = useState(false);

  const isEditMode = Boolean(classroomId);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return 'Basics';
      case 2:
        return 'Cover + Visibility';
      case 3:
        return 'Schedule + Capacity';
      case 4:
        return 'Pricing';
      default:
        return 'Create classroom';
    }
  }, [step]);

  const totalSteps = 4;

  const canProceed = useMemo(() => {
    if (loadingClassroom) return false;
    if (step === 1) {
      return Boolean(title.trim());
    }
    if (step === 4 && priceType === 'paid') {
      return Boolean(price) && Number(price) > 0;
    }
    return true;
  }, [loadingClassroom, price, priceType, step, title]);

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

  const parseDateValue = (value: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const formatInputDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}`;
  };

  const loadClassroom = async () => {
    if (!classroomId || !accessToken) return;
    setLoadingClassroom(true);
    try {
      const data = await classroomsService.getClassroom(classroomId);
      if (!data) return;
      setTitle(data.title ?? '');
      setShortDescription(data.shortDescription ?? '');
      setSubject(data.subject ?? '');
      setTags(data.tags ?? []);
      setCoverImageUrl(data.coverImageUrl ?? '');
      setIsLocked(Boolean(data.isLocked));
      setIsAlwaysLiveDemo(Boolean(data.isAlwaysLiveDemo));
      setStartsAt(data.startsAt ? formatInputDate(data.startsAt) : '');
      setEndsAt(data.endsAt ? formatInputDate(data.endsAt) : '');
      setFrequency(data.frequency ?? '');
      setMaxSeats(data.maxSeats ? String(data.maxSeats) : '');
      setMinAge(data.minAge ? String(data.minAge) : '');
      setPriceType((data.priceType as PriceType) ?? 'free');
      setPrice(data.price ? String(data.price) : '');
      setSubscriptionType(data.subscriptionType ?? '');
    } catch (error) {
      Alert.alert('Unable to load classroom', getApiErrorMessage(error));
    } finally {
      setLoadingClassroom(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      void loadClassroom();
    }
  }, [classroomId, isEditMode]);

  const handleSubmit = async () => {
    if (!accessToken) {
      router.push('/auth');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        shortDescription: shortDescription.trim() || undefined,
        subject: subject.trim() || undefined,
        tags: tags.length ? tags : undefined,
        coverImageUrl: coverImageUrl || undefined,
        isLocked,
        isAlwaysLiveDemo,
        startsAt: parseDateValue(startsAt),
        endsAt: parseDateValue(endsAt),
        frequency: frequency || undefined,
        maxSeats: maxSeats ? Number(maxSeats) : undefined,
        minAge: minAge ? Number(minAge) : undefined,
        priceType,
        price: priceType === 'paid' ? Number(price) : undefined,
        subscriptionType: subscriptionType || undefined,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      if (isEditMode && classroomId) {
        const updated = await classroomsService.updateClassroom(classroomId, payload);
        Alert.alert('Classroom updated', 'Your changes were saved.');
        if (updated?.id) {
          router.replace(`/classrooms/${updated.id}`);
        } else {
          router.replace('/');
        }
      } else {
        const created = await classroomsService.createClassroom(payload);
        Alert.alert('Classroom created', 'Your classroom is live.');
        if (created?.id) {
          router.replace(`/classrooms/${created.id}`);
        } else {
          router.replace('/');
        }
      }
    } catch (error) {
      Alert.alert(isEditMode ? 'Unable to update classroom' : 'Unable to create classroom', getApiErrorMessage(error));
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
              {isEditMode ? 'Update classroom' : 'Create classroom'}
            </Text>
            <Button title="Back" variant="secondary" onPress={() => router.back()} style={styles.backButton} />
          </View>
          <Text variant="small" color={colors.mutedText} style={styles.stepLabel}>
            Step {step} of {totalSteps} · {stepTitle}
          </Text>

          {loadingClassroom ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.primary} />
              <Text variant="small" color={colors.mutedText}>
                Loading classroom...
              </Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <Input label="Title *" placeholder="Give this classroom a name" value={title} onChangeText={setTitle} />
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
          ) : null}

          {step === 2 ? (
            <View>
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
              <View style={styles.toggleRow}>
                <View>
                  <Text variant="small" weight="600">
                    Locked classroom
                  </Text>
                  <Text variant="tiny" color={colors.mutedText}>
                    Require approval before joining.
                  </Text>
                </View>
                <Switch value={isLocked} onValueChange={setIsLocked} />
              </View>
              <View style={styles.toggleRow}>
                <View>
                  <Text variant="small" weight="600">
                    Always live demo
                  </Text>
                  <Text variant="tiny" color={colors.mutedText}>
                    Make this classroom feel live.
                  </Text>
                </View>
                <Switch value={isAlwaysLiveDemo} onValueChange={setIsAlwaysLiveDemo} />
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <Text variant="small" weight="600" style={styles.sectionLabel}>
                Schedule
              </Text>
              <Input
                label="Starts at"
                placeholder="YYYY-MM-DD HH:mm"
                value={startsAt}
                onChangeText={setStartsAt}
              />
              <Input
                label="Ends at"
                placeholder="YYYY-MM-DD HH:mm"
                value={endsAt}
                onChangeText={setEndsAt}
              />
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
                      onPress={() => setFrequency(option)}
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
              <Input
                label="Minimum age"
                placeholder="e.g. 12"
                keyboardType="number-pad"
                value={minAge}
                onChangeText={setMinAge}
              />
            </View>
          ) : null}

          {step === 4 ? (
            <View>
              <Text variant="small" weight="600" style={styles.sectionLabel}>
                Pricing
              </Text>
              <View style={styles.segmentedRow}>
                {(['free', 'paid'] as PriceType[]).map((option) => {
                  const active = priceType === option;
                  return (
                    <Pressable
                      key={option}
                      style={[styles.segmentedButton, active && styles.segmentedButtonActive]}
                      onPress={() => setPriceType(option)}
                    >
                      <Text variant="small" weight="600" color={active ? colors.textDark : colors.mutedText}>
                        {option === 'free' ? 'Free' : 'Paid'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {priceType === 'paid' ? (
                <Input
                  label="Price"
                  placeholder="Enter amount"
                  keyboardType="number-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              ) : null}
              <Input
                label="Subscription type (optional)"
                placeholder="Monthly, yearly, one-time..."
                value={subscriptionType}
                onChangeText={setSubscriptionType}
              />
              <View style={styles.reviewCard}>
                <Text variant="small" weight="600">
                  Review summary
                </Text>
                <Text variant="tiny" color={colors.mutedText}>
                  {title || 'Untitled classroom'} · {priceType === 'paid' ? `$${price || 0}` : 'Free'}
                </Text>
                {subject ? (
                  <Text variant="tiny" color={colors.mutedText}>
                    Subject: {subject}
                  </Text>
                ) : null}
                {tags.length ? (
                  <Text variant="tiny" color={colors.mutedText}>
                    Tags: {tags.join(', ')}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 ? <Button title="Back" variant="secondary" onPress={() => setStep((prev) => prev - 1)} /> : null}
          {step < totalSteps ? (
            <Button title="Next" onPress={() => setStep((prev) => prev + 1)} disabled={!canProceed} />
          ) : (
            <Button
              title={submitting ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update classroom' : 'Create classroom'}
              onPress={handleSubmit}
              disabled={!canProceed}
            />
          )}
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
    marginBottom: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.md,
  },
  stepLabel: {
    marginBottom: spacing.lg,
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  sectionLabel: {
    marginBottom: spacing.sm,
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
});
