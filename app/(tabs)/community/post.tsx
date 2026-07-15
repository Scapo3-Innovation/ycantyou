import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useCommunityFeedback } from '@/features/community/CommunityFeedbackContext';
import { CommentItem } from '@/features/community/components/CommentItem';
import { IncognitoToggle } from '@/features/community/components/IncognitoToggle';
import {
  CommunityModerationSheet,
  type ModerationMenuTarget,
} from '@/features/community/components/CommunityModerationSheet';
import { PostCard } from '@/features/community/components/PostCard';
import { COMMUNITY_DISCLAIMER } from '@/features/community/constants';
import {
  authorIdFromTarget,
  authorLabelFromTarget,
  moderationTargetFromComment,
  moderationTargetFromPost,
} from '@/features/community/moderation';
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
import { colors, FLOATING_TAB_BAR_HEIGHT, radius, spacing, typography } from '@/theme';

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const { showToast, showFollowToast } = useCommunityFeedback();

  const [comment, setComment] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(true);
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => new Set());
  const [menuTarget, setMenuTarget] = useState<ModerationMenuTarget | null>(null);

  const composerBottomPad =
    Math.max(insets.bottom, spacing.sm) + FLOATING_TAB_BAR_HEIGHT + spacing.sm;

  function toggleFollow(authorId: string) {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(authorId)) next.delete(authorId);
      else next.add(authorId);
      return next;
    });
  }

  function onPostMenu(post: FeedPost) {
    setMenuTarget(moderationTargetFromPost(post));
  }

  function onCommentMenu(c: PostComment) {
    setMenuTarget(moderationTargetFromComment(c));
  }

  function onModerationReport(reason: string) {
    if (!menuTarget) return;
    const target =
      menuTarget.type === 'post'
        ? { postId: menuTarget.post.id }
        : { commentId: menuTarget.comment.id };
    report.mutate(
      { target, reason },
      {
        onSuccess: () =>
          showToast({
            message: 'Report submitted',
            subtitle: 'Thanks — our team will review it',
            icon: 'flag',
            tone: 'success',
          }),
      },
    );
  }

  function onModerationBlock() {
    if (!menuTarget) return;
    block.mutate(authorIdFromTarget(menuTarget), {
      onSuccess: () => {
        showToast({
          message: 'Author blocked',
          subtitle: 'Their posts are hidden from you',
          icon: 'ban-outline',
        });
        if (menuTarget.type === 'post') router.back();
      },
    });
  }

  function onModerationDelete() {
    if (!menuTarget) return;
    if (menuTarget.type === 'post') {
      deletePost.mutate(menuTarget.post.id, { onSuccess: () => router.back() });
      return;
    }
    deleteComment.mutate(menuTarget.comment.id);
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
      <Screen style={styles.screen}>
        <ScreenHeader title="Post" onBack={() => router.back()} />
        <EmptyState icon="chatbubble-outline" title="Post not found" message="It may have been removed." />
      </Screen>
    );
  }

  const { post, comments } = data;
  const canReply = comment.trim().length > 0 && !addComment.isPending;

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Post" onBack={() => router.back()} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
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

          <View style={styles.sectionDivider} />

          <View style={styles.repliesHeader}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>Replies</Text>
            {post.commentCount > 0 ? (
              <View style={styles.countPill}>
                <Text style={[typography.captionMedium, { color: colors.primary }]}>
                  {post.commentCount}
                </Text>
              </View>
            ) : null}
          </View>

          {comments.length === 0 ? (
            <Text style={[typography.caption, styles.emptyReplies, { color: colors.textMuted }]}>
              No replies yet. Be supportive — not medical advice.
            </Text>
          ) : (
            <View style={styles.replies}>
              {comments.map((c, index) => (
                <View key={c.id}>
                  <CommentItem
                    comment={c}
                    onMenu={() => onCommentMenu(c)}
                    onToggleLike={() =>
                      commentLike.mutate({ commentId: c.id, liked: c.likedByMe })
                    }
                  />
                  {index < comments.length - 1 ? <View style={styles.replyDivider} /> : null}
                </View>
              ))}
            </View>
          )}

          <Text style={[typography.caption, styles.disclaimer, { color: colors.textFaint }]}>
            {COMMUNITY_DISCLAIMER}
          </Text>
        </ScrollView>

        <View style={[styles.composer, { paddingBottom: composerBottomPad }]}>
          <View style={styles.composerTop}>
            <IncognitoToggle
              value={commentAnonymous}
              onChange={setCommentAnonymous}
              compact
            />
          </View>
          <View style={styles.composerRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Post your reply"
              placeholderTextColor={colors.textFaint}
              multiline
              style={[typography.body, styles.replyInput, { color: colors.text }]}
            />
            <Pressable
              onPress={onSend}
              disabled={!canReply}
              accessibilityRole="button"
              accessibilityLabel="Reply"
              style={({ pressed }) => [
                styles.replyBtn,
                canReply ? styles.replyBtnActive : styles.replyBtnDisabled,
                pressed && canReply && styles.pressed,
              ]}>
              {addComment.isPending ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text
                  style={[
                    typography.button,
                    { color: canReply ? colors.primaryText : colors.textMuted },
                  ]}>
                  Reply
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CommunityModerationSheet
        target={menuTarget}
        isFollowing={menuTarget ? followedIds.has(authorIdFromTarget(menuTarget)) : false}
        onClose={() => setMenuTarget(null)}
        onFollow={() => {
          if (!menuTarget) return;
          toggleFollow(authorIdFromTarget(menuTarget));
          showFollowToast(authorLabelFromTarget(menuTarget), true);
        }}
        onUnfollow={() => {
          if (!menuTarget) return;
          toggleFollow(authorIdFromTarget(menuTarget));
          showFollowToast(authorLabelFromTarget(menuTarget), false);
        }}
        onReport={onModerationReport}
        onBlock={onModerationBlock}
        onDelete={onModerationDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  sectionDivider: {
    height: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  repliesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  countPill: {
    backgroundColor: colors.roseTint,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  emptyReplies: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  replies: {
    paddingHorizontal: spacing.lg,
  },
  replyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 40,
  },
  disclaimer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    lineHeight: 18,
  },
  composer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  composerTop: {
    flexDirection: 'row',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 96,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    lineHeight: 20,
  },
  replyBtn: {
    minWidth: 68,
    minHeight: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  replyBtnActive: {
    backgroundColor: colors.primary,
  },
  replyBtnDisabled: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.88,
  },
});
