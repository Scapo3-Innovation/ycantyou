import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import type { PostComment } from '../types';

const timeAgo = (iso: string) => formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });

/** A single comment with author meta and an options menu. */
export function CommentItem({ comment, onMenu }: { comment: PostComment; onMenu: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={[typography.body, { color: colors.text }]}>{comment.body}</Text>
      <View style={styles.footer}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {comment.isOwn ? 'You' : 'Community member'} · {timeAgo(comment.created_at)}
        </Text>
        <Pressable
          onPress={onMenu}
          accessibilityRole="button"
          accessibilityLabel="Comment options"
          hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
