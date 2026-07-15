import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { formatCompactCount } from '@/features/community/formatCount';
import { buildPostShareMessage } from '@/features/community/shareMessage';
import { tagLabel } from '@/features/community/tagLabels';
import { colors, radius, spacing, typography } from '@/theme';

import type { FeedPost } from '../types';

const PREVIEW_LENGTH = 220;

type PostCardProps = {
  post: FeedPost;
  onPress?: () => void;
  onToggleLike: () => void;
  onToggleDislike: () => void;
  onMenu: () => void;
  interactive?: boolean;
  variant?: 'feed' | 'detail';
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
};

const timeAgo = (iso: string) =>
  formatDistanceToNowStrict(parseISO(iso), { addSuffix: false })
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd');

function authorInitial(label: string): string {
  const trimmed = label.trim();
  if (!trimmed || trimmed.toLowerCase() === 'anonymous') return '?';
  return trimmed.charAt(0).toUpperCase();
}

export function PostCard({
  post,
  onPress,
  onToggleLike,
  onToggleDislike,
  onMenu,
  interactive = true,
  variant = 'feed',
  bookmarked = false,
  onToggleBookmark,
}: PostCardProps) {
  if (variant === 'detail') {
    return (
      <DetailPostCard
        post={post}
        onToggleLike={onToggleLike}
        onToggleDislike={onToggleDislike}
        onMenu={onMenu}
      />
    );
  }

  const isAnonymous = post.is_anonymous && !post.isOwn;
  const isLong = post.body.length > PREVIEW_LENGTH;
  const preview = isLong ? `${post.body.slice(0, PREVIEW_LENGTH).trim()}…` : post.body;

  async function onShare() {
    try {
      await Share.share({
        message: buildPostShareMessage({
          body: post.body,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
        }),
      });
    } catch {
      /* dismissed */
    }
  }

  const postBody = (
    <>
      <View style={styles.feedHeader}>
        <View
          style={[
            styles.feedAvatar,
            { backgroundColor: isAnonymous ? colors.surfaceAlt : colors.roseTint },
          ]}>
          {isAnonymous ? (
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
          ) : (
            <Text style={[typography.captionMedium, { color: colors.primary }]}>
              {authorInitial(post.authorLabel)}
            </Text>
          )}
        </View>
        <Text style={[typography.caption, styles.time, { color: colors.textMuted }]}>
          {timeAgo(post.created_at)}
        </Text>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel="Post options"
          hitSlop={12}
          style={styles.menuHit}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={[typography.body, styles.bodyText, { color: colors.text }]}>
        {preview}
        {isLong ? (
          <Text style={[typography.body, { color: colors.secondary }]} onPress={onPress}>
            {' '}
            Continue reading
          </Text>
        ) : null}
      </Text>

      {post.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {post.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
                {tagLabel(tag)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {post.commentCount > 0 && onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" style={styles.viewComments}>
          <Text style={[typography.captionMedium, { color: colors.secondary }]}>
            View all {formatCompactCount(post.commentCount)} comments
          </Text>
        </Pressable>
      ) : null}
    </>
  );

  return (
    <View style={styles.feedPost}>
      {interactive && onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={({ pressed }) => [pressed && styles.pressed]}>
          {postBody}
        </Pressable>
      ) : (
        postBody
      )}

      <View style={styles.actions}>
        <FeedAction
          icon={post.likedByMe ? 'heart' : 'heart-outline'}
          count={post.likeCount}
          onPress={onToggleLike}
          active={post.likedByMe}
          activeColor={colors.primary}
          accessibilityLabel={post.likedByMe ? 'Unlike' : 'Like'}
        />
        <FeedAction
          icon="chatbubble-outline"
          count={post.commentCount}
          onPress={onPress ?? (() => undefined)}
          accessibilityLabel="Comments"
        />
        <FeedAction icon="paper-plane-outline" onPress={() => void onShare()} accessibilityLabel="Share" />
        <View style={styles.actionsSpacer} />
        <FeedAction
          icon={bookmarked ? 'bookmark' : 'bookmark-outline'}
          onPress={onToggleBookmark ?? (() => undefined)}
          active={bookmarked}
          activeColor={colors.text}
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />
    </View>
  );
}

function DetailPostCard({
  post,
  onToggleLike,
  onToggleDislike,
  onMenu,
}: Pick<PostCardProps, 'post' | 'onToggleLike' | 'onToggleDislike' | 'onMenu'>) {
  const isAnonymous = post.is_anonymous && !post.isOwn;

  return (
    <View style={styles.detailPost}>
      <View style={styles.feedHeader}>
        <View
          style={[
            styles.feedAvatar,
            { backgroundColor: isAnonymous ? colors.surfaceAlt : colors.roseTint },
          ]}>
          {isAnonymous ? (
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
          ) : (
            <Text style={[typography.captionMedium, { color: colors.primary }]}>
              {authorInitial(post.authorLabel)}
            </Text>
          )}
        </View>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{post.authorLabel}</Text>
        <Text style={[typography.caption, { color: colors.textFaint }]}>
          · {timeAgo(post.created_at)}
        </Text>
        <View style={styles.headerSpacer} />
        <Pressable onPress={onMenu} hitSlop={12} accessibilityRole="button">
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={[typography.body, styles.bodyText, { color: colors.text }]}>{post.body}</Text>

      {post.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={[typography.captionMedium, { color: colors.primary }]}>
                {tagLabel(tag)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.actions, styles.detailActions]}>
        <FeedAction
          icon={post.likedByMe ? 'heart' : 'heart-outline'}
          count={post.likeCount}
          onPress={onToggleLike}
          active={post.likedByMe}
          activeColor={colors.primary}
          accessibilityLabel="Like"
        />
        <FeedAction
          icon={post.dislikedByMe ? 'thumbs-down' : 'thumbs-down-outline'}
          count={post.dislikeCount}
          onPress={onToggleDislike}
          active={post.dislikedByMe}
          activeColor={colors.warning}
          accessibilityLabel="Not helpful"
        />
        <FeedAction
          icon="chatbubble-outline"
          count={post.commentCount}
          onPress={() => undefined}
          accessibilityLabel="Comments"
        />
      </View>
    </View>
  );
}

function FeedAction({
  icon,
  count,
  onPress,
  active = false,
  activeColor = colors.textMuted,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
      <Ionicons name={icon} size={22} color={active ? activeColor : colors.text} />
      {count != null && count > 0 ? (
        <Text
          style={[
            typography.captionMedium,
            styles.actionCount,
            { color: active ? activeColor : colors.text },
          ]}>
          {formatCompactCount(count)}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  feedPost: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.surface,
  },
  detailPost: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 13,
  },
  headerSpacer: {
    flex: 1,
  },
  menuHit: {
    padding: spacing.xs,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tagPill: {
    backgroundColor: colors.roseTint,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  detailActions: {
    paddingHorizontal: 0,
    marginTop: spacing.sm,
  },
  actionsSpacer: {
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionCount: {
    fontSize: 13,
  },
  viewComments: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.lg,
  },
});
