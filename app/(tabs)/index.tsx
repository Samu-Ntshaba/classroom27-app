import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppShell } from '../../components/learning/app-shell';
import { FeedCard, Post } from '../../components/learning/feed-card';
import { FloatingCreateButton } from '../../components/posts/floating-create-button';
import { brandColors, brandRadii, brandTypography } from '../../lib/branding';

const posts: Post[] = [
  {
    id: 'post-1',
    type: 'VIDEO',
    title: 'Quiet focus: layering highlights on a 3-minute note.',
    description: 'Auto-play preview with muted audio keeps your flow without surprises.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
    author: { id: '1', name: 'Camille Huynh', isVerified: true },
    timeAgo: '3m ago · Skillshot',
    sponsored: true,
    stats: { likes: 2100, comments: 321, saves: 98 },
  },
  {
    id: 'post-2',
    type: 'IMAGE',
    title: 'Studio lighting basics for calm creator classrooms',
    description: 'Rounded cards, subtle scrims, and balanced contrast keep students anchored.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    author: { id: '2', name: 'Zora Blake', isVerified: true },
    timeAgo: '12m ago · Creator tips',
    stats: { likes: 980, comments: 102, saves: 34 },
  },
  {
    id: 'post-3',
    type: 'POLL',
    title: 'What keeps you in the flow when studying? ',
    description: 'Tap once to lock your choice. Polls stay gentle so you keep scrolling.',
    thumbnailUrl: '',
    pollOptions: [
      { label: 'Mini sprints + breaks', votes: 42 },
      { label: 'Ambient focus playlists', votes: 33 },
      { label: 'Group accountability', votes: 25 },
    ],
    pollVotes: 100,
    author: { id: '3', name: 'Marcos Ren' },
    timeAgo: '25m ago · Community',
    stats: { likes: 1400, comments: 187, saves: 44 },
  },
  {
    id: 'post-4',
    type: 'CLASSROOM',
    title: 'Calm camera presence for live tutoring sessions',
    description: 'A live walk-through with layered examples and gentle Q&A prompts.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501556482469-75c87e4b218b?auto=format&fit=crop&w=1200&q=80',
    author: { id: '4', name: 'Anika Ellis', isVerified: true },
    timeAgo: 'Live · 420 learning',
    status: 'LIVE',
    stats: { likes: 3200, comments: 672, saves: 120 },
  },
];

const trendingClassrooms = [
  { name: 'Visual note-taking lab', meta: '1.2k learners' },
  { name: 'Everyday math studios', meta: '842 learners' },
  { name: 'Live Q&A: brand storytelling', meta: '672 learners' },
];

const suggestedCreators = [
  { name: 'Sonia Park', meta: 'Community · Calm build logs' },
  { name: 'Adeyemi Bello', meta: 'STEM · Study nights' },
  { name: 'Alexis Knight', meta: 'Coaching · Classrooms on demand' },
];

export default function FeedScreen() {
  return (
    <AppShell>
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.kicker}>YOUR FEED</Text>
            <Text style={styles.heading}>A calm, mobile-first stream for learners.</Text>
            <Text style={styles.subheading}>
              Tall media, polls, and live classrooms sit together with gentle shadows and clear actions.
            </Text>
            <View style={styles.composerRow}>
              <ComposerCard icon="create" title="Start a post" description="Share a quick insight or note." />
              <ComposerCard icon="bar-chart" title="Ask a poll" description="Gather the room with one tap." />
            </View>
          </View>

          <View style={styles.feedStack}>
            {posts.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}
          </View>

          <View style={styles.sidebarSection}>
            <SidebarList title="Trending classrooms" items={trendingClassrooms} icon="flame" />
            <SidebarList title="Suggested for you" items={suggestedCreators} icon="sparkles" />
          </View>
        </ScrollView>
        <FloatingCreateButton />
      </View>
    </AppShell>
  );
}

function ComposerCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <TouchableOpacity style={styles.composerCard} activeOpacity={0.92}>
      <View style={styles.composerIcon}>
        <Ionicons name={icon} size={18} color={brandColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.composerTitle}>{title}</Text>
        <Text style={styles.composerDescription}>{description}</Text>
      </View>
      <Ionicons name="arrow-forward" size={16} color={brandColors.primary} />
    </TouchableOpacity>
  );
}

function SidebarList({
  title,
  items,
  icon,
}: {
  title: string;
  items: { name: string; meta: string }[];
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.sidebarCard}>
      <View style={styles.sidebarHeader}>
        <Ionicons name={icon} size={16} color={brandColors.primary} />
        <Text style={styles.sidebarTitle}>{title}</Text>
      </View>
      <View style={styles.sidebarList}>
        {items.map((item) => (
          <View key={item.name} style={styles.sidebarItem}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarInitial}>{item.name.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sidebarName}>{item.name}</Text>
              <Text style={styles.sidebarMeta}>{item.meta}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={brandColors.muted} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: brandColors.surface,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 120,
    gap: 18,
  },
  sectionHeader: {
    gap: 8,
    padding: 16,
    backgroundColor: brandColors.hero,
    borderRadius: brandRadii.card,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  kicker: {
    ...brandTypography.micro,
    color: brandColors.primaryStrong,
  },
  heading: {
    ...brandTypography.heading,
    color: brandColors.ink,
  },
  subheading: {
    ...brandTypography.body,
    color: brandColors.muted,
  },
  composerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  composerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: brandRadii.card,
    padding: 12,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  composerIcon: {
    width: 36,
    height: 36,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  composerTitle: {
    fontWeight: '800',
    color: brandColors.ink,
  },
  composerDescription: {
    color: brandColors.muted,
    fontSize: 13,
  },
  feedStack: {
    gap: 16,
  },
  sidebarSection: {
    gap: 12,
  },
  sidebarCard: {
    backgroundColor: '#fff',
    borderRadius: brandRadii.card,
    borderWidth: 1,
    borderColor: brandColors.border,
    padding: 14,
    gap: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarTitle: {
    fontWeight: '800',
    color: brandColors.ink,
  },
  sidebarList: {
    gap: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarAvatar: {
    width: 42,
    height: 42,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  sidebarInitial: {
    fontWeight: '800',
    color: brandColors.primary,
  },
  sidebarName: {
    fontWeight: '700',
    color: brandColors.ink,
  },
  sidebarMeta: {
    color: brandColors.muted,
    fontSize: 12,
  },
});
