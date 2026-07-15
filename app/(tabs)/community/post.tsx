import { Ionicons } from '@expo/vector-icons';
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
  TextInput,
  View,
} from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { CommentItem } from '@/features/community/components/CommentItem';
import { IncognitoToggle } from '@/features/community/components/IncognitoToggle';
import { PostCard } from '@/features/community/components/PostCard';
import { COMMUNITY_DISCLAIMER } from '@/features/community/constants';
import { presentModerationMenu, presentReportReasons } from '@/features/community/moderation';
import {
  useAddComment,
  useBlockUser,
  useDeleteComment,
  useDeletePost,
  useReport,
  useToggleCommentLike,
  useToggleDislike,
  useToggleLike,
} from '@/features/community/mutations';
import { usePostDetail } from '@/features/community/queries';
import type { FeedPost, PostComment } from '@/features/community/types';
import { commentSchema } from '@/features/community/validation';
import { colors, spacing, typography } from '@/theme';

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = id ?? '';

  const { data, isLoading } = usePostDetail(postId);
  const like = useToggleLike();
  const dislike = useToggleDislike();
  const commentLike = useToggleCommentLike(postId);
  const report = useReport();
  const block = useBlockUser();
  const deletePost = useDeletePost();
  const deleteComment = useDeleteComment(postId);
  const addComment = useAddComment(postId);

  const [comment, setComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(true);

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
          { text: 'Delete', style: 'destructive', onPress: () => deletePost.mutate(post.id, { onSuccess: () => router.back() }) },
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
    addComment.mutate(
      { body: parsed.data.body, is_anonymous: commentAnonymous },
      { onSuccess: () => setComment('') },
    );
  }

  if (isLoading) return <LoadingScreen />;

  if (!data) {
    return (
      <Screen edgeToEdge>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Post</Text>
          <View style={styles.topSide} />
        </View>
        <EmptyState icon="chatbubble-outline" title="Post not found" message="It may have been removed." />
      </Screen>
    );
  }

  const { post, comments } = data;
  const canReply = comment.trim().length > 0 && !addComment.isPending;

  return (
    <Screen edgeToEdge>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Post</Text>
          <View style={styles.topSide} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <PostCard
            post={post}
            variant="detail"
            interactive={false}
            onToggleLike={() => like.mutate({ postId: post.id, liked: post.likedByMe })}
            onToggleDislike={() =>
              dislike.mutate({ postId: post.id, disliked: post.dislikedByMe })
            }
            onMenu={() => onPostMenu(post)}
          />

          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

          <View style={styles.repliesHeader}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              Replies
            </Text>
            {post.commentCount > 0 ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {post.commentCount}
              </Text>
            ) : null}
          </View>

          {comments.length === 0 ? (
            <Text style={[typography.body, styles.emptyReplies, { color: colors.textMuted }]}>
              No replies yet. Be supportive — not medical advice.
            </Text>
          ) : (
            <View style={styles.replies}>
              {comments.map((c) => (
                <View key={c.id}>
                  <CommentItem
                    comment={c}
                    onMenu={() => onCommentMenu(c)}
                    onToggleLike={() =>
                      commentLike.mutate({ commentId: c.id, liked: c.likedByMe })
                    }
                  />
                  <View style={[styles.replyDivider, { backgroundColor: colors.border }]} />
                </View>
              ))}
            </View>
          )}

          <Text style={[typography.caption, styles.disclaimer, { color: colors.textFaint }]}>
            {COMMUNITY_DISCLAIMER}
          </Text>
        </ScrollView>

        <View
          style={[
            styles.composer,
            { borderTopColor: colors.border, backgroundColor: colors.background },
          ]}>
          <IncognitoToggle value={commentAnonymous} onChange={setCommentAnonymous} />
          <View style={styles.composerRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Post your reply"
              placeholderTextColor={colors.textFaint}
              multiline
              style={[styles.replyInput, { color: colors.text }]}
            />
            <Pressable
              onPress={onSend}
              disabled={!canReply}
              accessibilityRole="button"
              accessibilityLabel="Reply"
              style={[styles.replyBtn, !canReply && styles.replyBtnDisabled]}>
              <Text
                style={[
                  typography.bodyMedium,
                  { color: canReply ? colors.primary : colors.textFaint },
                ]}>
                Reply
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topSide: {
    width: 22,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth * 4,
    backgroundColor: colors.surfaceAlt,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyReplies: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  replies: {
    paddingHorizontal: spacing.lg,
  },
  replyDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40,
  },
  disclaimer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  composer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    fontFamily: typography.body.fontFamily,
  },
  replyBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  replyBtnDisabled: {
    opacity: 0.5,
  },
});
