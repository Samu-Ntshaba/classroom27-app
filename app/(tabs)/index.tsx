import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const brand = {
  ink: '#0F172A',
  muted: '#475569',
  primary: '#7C3AED',
  primaryStrong: '#5B21B6',
  surface: '#F8FAFC',
  highlight: '#EEF2FF',
  hero: '#F4F4FF',
  border: '#E2E8F0',
  chip: '#E0F2FE',
  shadow: '#0F172A1A',
};

const feedItems = [
  {
    id: '1',
    type: 'video',
    title: 'Micro-lesson: Calm note-taking with layered highlights',
    author: 'Camille Huynh',
    meta: '3m preview · Skillshot',
    tag: 'Video',
    stats: { likes: '2.1k', comments: '321' },
    source:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80&sat=-50&exp=5',
    overlay:
      'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExazZrbjViOWtrcHdncDRyZXVuOHh6ZGRoMm4yZGtqNXEzZTE4NmJiciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SXxItdMfgQVzg/giphy.gif',
  },
  {
    id: '2',
    type: 'image',
    title: 'Studio lighting basics for creator classrooms',
    author: 'Zora Blake',
    meta: 'Lesson card · Creator tips',
    tag: 'Image',
    stats: { likes: '980', comments: '102' },
    source:
      'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '3',
    type: 'image',
    title: 'Flow-state study desk inspiration',
    author: 'Marcos Ren',
    meta: 'Moodboard · Community',
    tag: 'Poll',
    stats: { likes: '1.4k', comments: '187' },
    source:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
];

const learnerHighlights = [
  {
    title: 'Softly guided',
    description: 'Stacked prompts, check-ins, and nudges keep you in the flow without overwhelm.',
  },
  {
    title: 'Mixed-media feed',
    description: 'Video, polls, and image cards sit side-by-side with clear labels and actions.',
  },
  {
    title: 'Community-first',
    description: 'See likes, comments, and shares at a glance so you know where to jump in.',
  },
];

const pollCard = {
  question: 'What keeps you in the flow?',
  options: [
    { label: 'Mini sprints + breaks', votes: '42%' },
    { label: 'Ambient focus playlists', votes: '33%' },
    { label: 'Group accountability', votes: '25%' },
  ],
};

const engagementRow = [
  { icon: 'heart', label: '2.8k' },
  { icon: 'chatbubble', label: '412' },
  { icon: 'share-social', label: 'Share' },
];

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSurface}>
        <View style={styles.badgeRow}>
          <Badge icon="sparkles" label="Classroom 27" background={brand.highlight} />
          <Badge icon="leaf" label="Social learning" background={brand.surface} subtle />
        </View>

        <Text style={styles.headline}>A calm social feed for people who love to learn.</Text>
        <Text style={styles.supportText}>
          Build your own rhythm with video previews, rounded lesson cards, and a community that celebrates
          progress over perfection.
        </Text>

        <View style={styles.ctaRow}>
          <Link href="/home" asChild>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.92}>
              <Text style={styles.primaryButtonText}>Explore Content</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </Link>
          <View style={styles.secondaryButtons}>
            <Badge icon="play" label="Auto-playing previews" background={brand.surface} />
            <Badge icon="sparkles" label="Rounded cards + light shadows" background={brand.surface} />
            <Badge icon="phone-portrait" label="Made for mobile-first" background={brand.surface} />
          </View>
        </View>

        <View style={styles.affordanceRow}>
          {engagementRow.map((item) => (
            <TouchableOpacity key={item.icon} style={styles.affordanceChip} activeOpacity={0.9}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={brand.ink} />
              <Text style={styles.affordanceLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Preview the feed</Text>
        <Text style={styles.sectionDescription}>
          Mixed-media cards stack with gentle motion so you can peek without losing focus.
        </Text>

        <View style={styles.feedStack}>
          <View style={styles.feedColumn}>
            {feedItems.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </View>

          <View style={styles.utilityColumn}>
            <PollCard />
          </View>
        </View>
      </View>

      <View style={styles.highlightsSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Stay in the flow, anywhere</Text>
            <Text style={styles.sectionDescription}>
              Cards, polls, and previews are tuned for thumbs with soft corners and shadows.
            </Text>
          </View>
          <Link href="/home" asChild>
            <TouchableOpacity style={styles.ghostButton} activeOpacity={0.9}>
              <Text style={styles.ghostText}>Start learning</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.highlightGrid}>
          {learnerHighlights.map((highlight) => (
            <View key={highlight.title} style={styles.highlightCard}>
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
              <Text style={styles.highlightDescription}>{highlight.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bannerCta}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Ready to tutor next?</Text>
            <Text style={styles.bannerDescription}>
              Move from learner to guide with calm tools that respect your time and attention.
            </Text>
          </View>
          <View style={styles.bannerActions}>
            <Link href="/home" asChild>
              <TouchableOpacity style={styles.ghostButtonAlt} activeOpacity={0.9}>
                <Text style={styles.ghostTextAlt}>See the tutor path</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/register" asChild>
              <TouchableOpacity style={styles.primaryButtonSmall} activeOpacity={0.92}>
                <Text style={styles.primaryButtonText}>Create your account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Badge({
  label,
  icon,
  background,
  subtle,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  background: string;
  subtle?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: background,
          borderColor: subtle ? brand.border : background,
        },
      ]}>
      {icon ? <Ionicons name={icon} size={14} color={brand.ink} style={{ marginRight: 6 }} /> : null}
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

function FeedCard({
  item,
}: {
  item: (typeof feedItems)[number];
}) {
  return (
    <View style={styles.feedCard}>
      <ImageBackground
        source={{ uri: item.overlay || item.source }}
        style={styles.media}
        imageStyle={styles.mediaRadius}>
        <View style={styles.overlay} />
        <View style={styles.feedTopRow}>
          <Badge label={item.tag} background={brand.chip} subtle />
          <Text style={styles.metaText}>{item.meta}</Text>
        </View>
        <View style={styles.feedContent}>
          <Text style={styles.feedTitle}>{item.title}</Text>
          <View style={styles.feedFooter}>
            <View style={styles.authorPill}>
              <Ionicons name="person-circle" size={18} color={brand.ink} />
              <Text style={styles.authorText}>{item.author}</Text>
            </View>
            <View style={styles.statRow}>
              <Chip icon="heart" label={item.stats.likes} />
              <Chip icon="chatbubble" label={item.stats.comments} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

function Chip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color={brand.ink} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function PollCard() {
  return (
    <View style={styles.pollCard}>
      <View style={styles.pollHeader}>
        <Text style={styles.pollLabel}>Poll</Text>
        <Ionicons name="stats-chart" size={18} color={brand.primaryStrong} />
      </View>
      <Text style={styles.pollQuestion}>{pollCard.question}</Text>
      <View style={styles.pollOptions}>
        {pollCard.options.map((option) => (
          <View key={option.label} style={styles.pollOption}>
            <Text style={styles.pollOptionLabel}>{option.label}</Text>
            <View style={styles.pollBarTrack}>
              <View style={[styles.pollBarFill, { width: option.votes }]} />
            </View>
            <Text style={styles.pollVotes}>{option.votes}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.pollCta} activeOpacity={0.9}>
        <Text style={styles.pollCtaText}>See how the community voted</Text>
        <Ionicons name="arrow-forward" size={16} color={brand.primaryStrong} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: brand.surface,
    gap: 24,
  },
  heroSurface: {
    backgroundColor: brand.hero,
    padding: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: brand.border,
    shadowColor: brand.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeLabel: {
    color: brand.ink,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: brand.ink,
    lineHeight: 32,
  },
  supportText: {
    color: brand.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  ctaRow: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: brand.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: brand.primaryStrong,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  affordanceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  affordanceChip: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: brand.border,
    shadowColor: brand.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  affordanceLabel: {
    color: brand.ink,
    fontWeight: '600',
  },
  previewSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: brand.ink,
  },
  sectionDescription: {
    color: brand.muted,
    lineHeight: 21,
    fontSize: 15,
  },
  feedStack: {
    gap: 16,
  },
  feedColumn: {
    gap: 16,
  },
  utilityColumn: {
    gap: 12,
  },
  feedCard: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: brand.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  media: {
    height: 280,
    justifyContent: 'space-between',
  },
  mediaRadius: {
    borderRadius: 26,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  feedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  metaText: {
    color: '#fff',
    fontWeight: '600',
  },
  feedContent: {
    padding: 16,
    gap: 12,
  },
  feedTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  feedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorPill: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    color: brand.ink,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipLabel: {
    color: brand.ink,
    fontWeight: '700',
  },
  pollCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: brand.border,
    gap: 12,
    shadowColor: brand.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollLabel: {
    color: brand.primaryStrong,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pollQuestion: {
    color: brand.ink,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
  },
  pollOptions: {
    gap: 12,
  },
  pollOption: {
    gap: 6,
  },
  pollOptionLabel: {
    color: brand.ink,
    fontWeight: '600',
  },
  pollBarTrack: {
    height: 10,
    backgroundColor: brand.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: brand.border,
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    backgroundColor: brand.primary,
  },
  pollVotes: {
    color: brand.muted,
    fontWeight: '600',
  },
  pollCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pollCtaText: {
    color: brand.primaryStrong,
    fontWeight: '700',
  },
  highlightsSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  highlightGrid: {
    gap: 12,
  },
  highlightCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: brand.border,
    gap: 6,
    shadowColor: brand.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  highlightTitle: {
    color: brand.ink,
    fontWeight: '800',
    fontSize: 16,
  },
  highlightDescription: {
    color: brand.muted,
    lineHeight: 20,
  },
  bannerCta: {
    backgroundColor: brand.highlight,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: brand.border,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  bannerTitle: {
    color: brand.ink,
    fontWeight: '800',
    fontSize: 17,
  },
  bannerDescription: {
    color: brand.muted,
    lineHeight: 21,
  },
  bannerActions: {
    gap: 10,
    alignItems: 'flex-end',
  },
  ghostButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: '#fff',
  },
  ghostText: {
    color: brand.ink,
    fontWeight: '700',
  },
  ghostButtonAlt: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.primary,
    backgroundColor: '#fff',
  },
  ghostTextAlt: {
    color: brand.primaryStrong,
    fontWeight: '700',
  },
  primaryButtonSmall: {
    backgroundColor: brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: brand.primaryStrong,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
});
