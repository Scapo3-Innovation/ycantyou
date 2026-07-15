import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { TrustedBadge } from './TrustedBadge';
import type { PostComment } from '../types';

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

type CommentItemProps = {
  comment: PostComment;
  onMenu: () => void;
  onToggleLike: () => void;
};

/** X-style reply row — avatar left, compact meta, inline actions. */
export function CommentItem({ comment, onMenu, onToggleLike }: CommentItemProps) {
  const isAnonymous = comment.authorLabel === 'Anonymous';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isAnonymous ? colors.surfaceAlt : colors.roseTint },
          ]}>
          {isAnonymous ? (
            <Ionicons name="person-outline" size={16} color={colors.textMuted} />
          ) : (
            <Text style={[typography.captionMedium, { color: colors.primary }]}>
              {authorInitial(comment.authorLabel)}
            </Text>
          )}
        </View>

        <View style={styles.bodyCol}>
          <View style={styles.metaRow}>
            <Text style={[typography.captionMedium, styles.name, { color: colors.text }]} numberOfLines={1}>
              {comment.authorLabel}
            </Text>
            <Text style={[typography.caption, { color: colors.textFaint }]}>·</Text>
            <Text style={[typography.caption, { color: colors.textFaint }]}>
              {timeAgo(comment.created_at)}
            </Text>
            {comment.isTrustedContributor ? <TrustedBadge /> : null}
            <View style={styles.metaSpacer} />
            <Pressable
              onPress={onMenu}
              accessibilityRole="button"
              accessibilityLabel="Comment options"
              hitSlop={12}>
              <Ionicons name="ellipsis-horizontal" size={14} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={[typography.body, styles.bodyText, { color: colors.text }]}>{comment.body}</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onToggleLike}
              accessibilityRole="button"
              accessibilityLabel={comment.likedByMe ? 'Unlike comment' : 'Like comment'}
              hitSlop={8}
              style={styles.action}>
              <Ionicons
                name={comment.likedByMe ? 'heart' : 'heart-outline'}
                size={16}
                color={comment.likedByMe ? colors.primary : colors.textMuted}
              />
              {comment.likeCount > 0 ? (
                <Text
                  style={[
                    typography.caption,
                    { color: comment.likedByMe ? colors.primary : colors.textMuted },
                  ]}>
                  {comment.likeCount}
                </Text>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyCol: {
    flex: 1,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  name: {
    fontWeight: '700',
  },
  metaSpacer: {
    flex: 1,
    minWidth: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
});
