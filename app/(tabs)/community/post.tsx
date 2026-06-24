import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { CommentItem } from '@/features/community/components/CommentItem';
import { presentModerationMenu, presentReportReasons } from '@/features/community/moderation';
import {
  useAddComment,
  useBlockUser,
  useDeleteComment,
  useDeletePost,
  useReport,
  useToggleLike,
} from '@/features/community/mutations';
import { usePostDetail } from '@/features/community/queries';
import type { FeedPost, PostComment } from '@/features/community/types';
import { commentSchema } from '@/features/community/validation';
import { colors, spacing, typography } from '@/theme';

const timeAgo = (iso: string) => formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = id ?? '';

  const { data, isLoading } = usePostDetail(postId);
  const like = useToggleLike();
  const report = useReport();
  const block = useBlockUser();
  const deletePost = useDeletePost();
  const deleteComment = useDeleteComment(postId);
  const addComment = useAddComment(postId);

  const [comment, setComment] = useState('');

  function onPostMenu(post: FeedPost) {
    presentModerationMenu({
      isOwn: post.isOwn,
      onReport: () =>
        presentReportReasons((reason) =>
          report.mutate(
            { target: { postId: post.id }, reason },
            { onSuccess: () => Alert.alert('Reported', 'Thanks — our team will review this.') },
          ),
        ),
      onBlock: () =>
        Alert.alert('Block author', 'Their posts and comments will be hidden from you.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => block.mutate(post.user_id, { onSuccess: () => router.back() }),
          },
        ]),
      onDelete: () =>
        Alert.alert('Delete post', 'This removes your post for everyone.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deletePost.mutate(post.id, { onSuccess: () => router.back() }),
          },
        ]),
    });
  }

  function onCommentMenu(c: PostComment) {
    presentModerationMenu({
      isOwn: c.isOwn,
      onReport: () =>
        presentReportReasons((reason) =>
          report.mutate(
            { target: { commentId: c.id }, reason },
            { onSuccess: () => Alert.alert('Reported', 'Thanks — our team will review this.') },
          ),
        ),
      onBlock: () =>
        Alert.alert('Block author', 'Their posts and comments will be hidden from you.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Block', style: 'destructive', onPress: () => block.mutate(c.user_id) },
        ]),
      onDelete: () =>
        Alert.alert('Delete comment', 'This removes your comment.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteComment.mutate(c.id) },
        ]),
    });
  }

  function onSend() {
    const parsed = commentSchema.safeParse({ body: comment });
    if (!parsed.success) return;
    addComment.mutate(parsed.data.body, { onSuccess: () => setComment('') });
  }

  if (isLoading) return <LoadingScreen />;

  if (!data) {
    return (
      <Screen>
        <ScreenHeader onBack={() => router.back()} />
        <EmptyState icon="chatbubble-outline" title="Post not found" message="It may have been removed." />
      </Screen>
    );
  }

  const { post, comments } = data;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ScreenHeader onBack={() => router.back()} />

          <Card>
            <View style={styles.rowBetween}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {post.isOwn ? 'You' : 'Community member'} · {timeAgo(post.created_at)}
              </Text>
              <Pressable
                onPress={() => onPostMenu(post)}
                accessibilityRole="button"
                accessibilityLabel="Post options"
                hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {post.title ? (
              <Text style={[typography.h2, { color: colors.text }]}>{post.title}</Text>
            ) : null}
            <Text style={[typography.body, { color: colors.text }]}>{post.body}</Text>

            {post.tags.length > 0 ? (
              <View style={styles.tags}>
                {post.tags.map((tag) => (
                  <Chip key={tag} label={tag} />
                ))}
              </View>
            ) : null}

            <Pressable
              onPress={() => like.mutate({ postId: post.id, liked: post.likedByMe })}
              accessibilityRole="button"
              accessibilityLabel={post.likedByMe ? 'Unlike' : 'Like'}
              style={styles.like}
              hitSlop={8}>
              <Ionicons
                name={post.likedByMe ? 'heart' : 'heart-outline'}
                size={20}
                color={post.likedByMe ? colors.primary : colors.textMuted}
              />
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {post.likeCount}
              </Text>
            </Pressable>
          </Card>

          <Text style={[typography.h2, { color: colors.text }]}>
            Comments ({post.commentCount})
          </Text>

          {comments.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              No comments yet. Start the conversation — kindly.
            </Text>
          ) : (
            <Card>
              {comments.map((c, i) => (
                <View key={c.id}>
                  {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                  <CommentItem comment={c} onMenu={() => onCommentMenu(c)} />
                </View>
              ))}
            </Card>
          )}
        </ScrollView>

        <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.composerField}>
            <TextField
              label=""
              value={comment}
              onChangeText={setComment}
              placeholder="Add a supportive comment…"
              multiline
            />
          </View>
          <Button label="Send" onPress={onSend} loading={addComment.isPending} disabled={!comment.trim()} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  like: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  composer: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerField: {
    // Lets the multiline field grow a little without pushing the button off-screen.
  },
});
