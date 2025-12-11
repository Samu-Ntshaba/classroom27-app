import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { brandColors, brandRadii, brandShadows, brandTypography } from '../../lib/branding';

export type PostType = 'VIDEO' | 'IMAGE' | 'POLL' | 'QUESTION' | 'CLASSROOM';

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl?: string;
  pollOptions?: { label: string; votes: number }[];
  pollVotes?: number;
  status?: 'LIVE' | 'UPCOMING' | 'RECORDED';
  startsAt?: string;
  attendees?: number;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  timeAgo: string;
  sponsored?: boolean;
  followers?: boolean;
  stats: {
    likes: number;
    comments: number;
    saves?: number;
  };
}

export function FeedCard({ post }: { post: Post }) {
  const isClassroom = post.type === 'CLASSROOM';
  const isPoll = post.type === 'POLL';

  return (
    <View style={[styles.card, brandShadows.soft]}>
      <View style={styles.headerRow}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{post.author.name.slice(0, 1)}</Text>
          </View>
          <View>
            <View style={styles.authorLine}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.isVerified && <Ionicons name="checkmark-circle" size={16} color={brandColors.primary} />}
              {post.sponsored && <Text style={styles.sponsored}>Sponsored</Text>}
            </View>
            <Text style={styles.metaText}>{post.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.followChip} activeOpacity={0.85}>
          <Ionicons name="add" size={14} color={brandColors.primary} />
          <Text style={styles.followLabel}>Follow</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      {post.description && <Text style={styles.description}>{post.description}</Text>}

      {isPoll ? (
        <View style={styles.pollBlock}>
          {post.pollOptions?.map((option) => {
            const totalVotes = post.pollVotes || 0;
            const percent = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
            return (
              <View key={option.label} style={styles.pollOption}>
                <Text style={styles.pollOptionLabel}>{option.label}</Text>
                <View style={styles.pollBarTrack}>
                  <View style={[styles.pollBarFill, { width: `${percent}%` }]} />
                </View>
                <Text style={styles.pollPercent}>{percent}%</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <ImageBackground
          source={{ uri: post.thumbnailUrl }}
          style={styles.media}
          imageStyle={{ borderRadius: brandRadii.media }}
        >
          <View style={styles.mediaOverlay} />
          <View style={styles.mediaTagRow}>
            <Text style={styles.tag}>{post.type}</Text>
            {isClassroom && post.status && (
              <View style={styles.livePill}>
                <Text style={styles.liveText}>{post.status === 'LIVE' ? 'LIVE' : 'CLASS'}</Text>
              </View>
            )}
          </View>
          {post.type === 'VIDEO' && (
            <View style={styles.playBadge}>
              <Ionicons name="play" size={18} color={brandColors.primary} />
              <Text style={styles.playLabel}>Tap to preview</Text>
            </View>
          )}
        </ImageBackground>
      )}

      <View style={styles.actionsRow}>
        <Action icon="heart" label={post.stats.likes} />
        <Action icon="chatbubble" label={post.stats.comments} />
        <Action icon="share-social" label="Share" />
        <Action icon="bookmark" label={post.stats.saves ?? 18} />
      </View>

      {isClassroom && (
        <TouchableOpacity style={styles.classroomCta} activeOpacity={0.9}>
          <Text style={styles.ctaLabel}>{post.status === 'LIVE' ? 'Join live classroom' : 'Set reminder'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function Action({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string | number }) {
  return (
    <TouchableOpacity style={styles.action} activeOpacity={0.8}>
      <Ionicons name={icon} size={18} color={brandColors.ink} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: brandRadii.card,
    borderWidth: 1,
    borderColor: brandColors.border,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  authorRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  avatarInitials: {
    color: brandColors.primaryStrong,
    fontWeight: '800',
  },
  authorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontWeight: '700',
    color: brandColors.ink,
  },
  sponsored: {
    color: brandColors.muted,
    fontSize: 12,
    borderWidth: 1,
    borderColor: brandColors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: brandRadii.pill,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaText: {
    color: brandColors.muted,
    fontSize: 12,
  },
  followChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: brandRadii.pill,
    backgroundColor: brandColors.highlight,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  followLabel: {
    fontWeight: '700',
    color: brandColors.primary,
  },
  title: {
    ...brandTypography.heading,
    color: brandColors.ink,
  },
  description: {
    ...brandTypography.body,
    color: brandColors.muted,
  },
  media: {
    height: 240,
    borderRadius: brandRadii.media,
    overflow: 'hidden',
    backgroundColor: brandColors.highlight,
    justifyContent: 'space-between',
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A33',
  },
  mediaTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  tag: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
  },
  livePill: {
    backgroundColor: brandColors.live,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: brandRadii.pill,
  },
  liveText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
  },
  playBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: brandRadii.pill,
    alignItems: 'center',
    gap: 8,
  },
  playLabel: {
    color: brandColors.primary,
    fontWeight: '700',
  },
  pollBlock: {
    gap: 10,
  },
  pollOption: {
    backgroundColor: brandColors.highlight,
    padding: 12,
    borderRadius: brandRadii.media,
    borderWidth: 1,
    borderColor: brandColors.border,
    gap: 6,
  },
  pollOptionLabel: {
    fontWeight: '700',
    color: brandColors.ink,
  },
  pollBarTrack: {
    height: 10,
    backgroundColor: '#fff',
    borderRadius: brandRadii.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  pollBarFill: {
    height: '100%',
    backgroundColor: brandColors.primary,
  },
  pollPercent: {
    color: brandColors.muted,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: brandColors.border,
    paddingTop: 10,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionLabel: {
    color: brandColors.ink,
    fontWeight: '700',
  },
  classroomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: brandColors.primary,
    padding: 14,
    borderRadius: brandRadii.media,
    marginTop: -4,
  },
  ctaLabel: {
    color: '#fff',
    fontWeight: '800',
  },
});
