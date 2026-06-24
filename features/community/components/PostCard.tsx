import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { colors, spacing, typography } from '@/theme';

import type { FeedPost } from '../types';

type PostCardProps = {
  post: FeedPost;
  onPress: () => void;
  onToggleLike: () => void;
  onMenu: () => void;
};

const timeAgo = (iso: string) => formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });

/** A post in the feed: meta, body, tags, like + comment counts, and an options menu. */
export function PostCard({ post, onPress, onToggleLike, onMenu }: PostCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card>
        <View style={styles.header}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {post.isOwn ? 'You' : 'Community member'} · {timeAgo(post.created_at)}
          </Text>
          <Pressable onPress={onMenu} accessibilityRole="button" accessibilityLabel="Post options" hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {post.title ? (
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{post.title}</Text>
        ) : null}
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={6}>
          {post.body}
        </Text>

        {post.tags.length > 0 ? (
          <View style={styles.tags}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Pressable
            onPress={onToggleLike}
            accessibilityRole="button"
            accessibilityLabel={post.likedByMe ? 'Unlike' : 'Like'}
            style={styles.stat}
            hitSlop={8}>
            <Ionicons
              name={post.likedByMe ? 'heart' : 'heart-outline'}
              size={18}
              color={post.likedByMe ? colors.primary : colors.textMuted}
            />
            <Text style={[typography.caption, { color: colors.textMuted }]}>{post.likeCount}</Text>
          </Pressable>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {post.commentCount}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
