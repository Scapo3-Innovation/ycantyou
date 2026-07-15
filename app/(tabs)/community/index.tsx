import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as RN from 'react-native';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { useCommunityFeedback } from '@/features/community/CommunityFeedbackContext';
import { CommunityConsentSheet } from '@/features/community/components/CommunityConsentSheet';
import { CommunityComposeFab } from '@/features/community/components/CommunityComposeFab';
import { CommunityFeedHeader } from '@/features/community/components/CommunityFeedHeader';
import {
  CommunityModerationSheet,
  type ModerationMenuTarget,
} from '@/features/community/components/CommunityModerationSheet';
import { PostCard } from '@/features/community/components/PostCard';
import { COMMUNITY_DISCLAIMER, type FeedFilter } from '@/features/community/constants';
import {
  authorIdFromTarget,
  authorLabelFromTarget,
  moderationTargetFromPost,
} from '@/features/community/moderation';
import {
  useBlockUser,
  useDeletePost,
  useReport,
  useToggleDislike,
  useToggleLike,
} from '@/features/community/mutations';
import { useFeed } from '@/features/community/queries';
import { useCommunityConsent } from '@/features/community/useCommunityConsent';
import type { FeedPost } from '@/features/community/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { profileFirstName } from '@/features/profile/firstName';
import { useProfile } from '@/features/profile/useProfile';
import { analytics } from '@/lib/analytics';
import { isSchemaNotReadyError, schemaNotReadyMessage } from '@/lib/supabaseErrors';
import { colors, floatingTabBarScrollInset, spacing, typography } from '@/theme';

export default function CommunityScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const {
    data: posts = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useFeed();
  const { accepted, accept, loading: consentLoading } = useCommunityConsent();
  const [filter, setFilter] = useState<FeedFilter>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set());
  const [followedIds, setFollowedIds] = useState<Set<string>>(() => new Set());
  const [menuTarget, setMenuTarget] = useState<ModerationMenuTarget | null>(null);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const like = useToggleLike();
  const dislike = useToggleDislike();
  const report = useReport();
  const block = useBlockUser();
  const deletePost = useDeletePost();
  const { showToast, showFollowToast, showRules } = useCommunityFeedback();

  const userInitial = useMemo(() => {
    const name = profileFirstName(profile?.full_name);
    if (name === 'there') return 'Y';
    return name.charAt(0).toUpperCase();
  }, [profile?.full_name]);

  useEffect(() => {
    if (accepted) analytics.track('community_feed_opened');
  }, [accepted]);

  useEffect(() => {
    if (!userId) return;
    void refetch();
  }, [userId, refetch]);

  const filteredPosts = useMemo(() => {
    let list = [...posts];
    const q = searchQuery.trim().toLowerCase();

    if (savedOnly) {
      list = list.filter((p) => bookmarkedIds.has(p.id));
    } else if (filter === 'mine') {
      list = list.filter((p) => p.isOwn);
      list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (filter === 'following') {
      list = list.filter((p) => followedIds.has(p.user_id));
      list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else {
      list.sort((a, b) => b.likeCount - a.likeCount || b.created_at.localeCompare(a.created_at));
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.body.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [posts, filter, searchQuery, followedIds, savedOnly, bookmarkedIds]);

  function onLikeError(err: unknown) {
    const detail = err instanceof Error ? err.message : '';
    if (isSchemaNotReadyError(err) || detail.includes('not set up on this server')) {
      showToast({
        message: 'Likes not set up yet',
        subtitle: schemaNotReadyMessage('Likes'),
        icon: 'heart-dislike-outline',
      });
      return;
    }
    if (detail === 'Sign in to like posts') {
      showToast({
        message: 'Sign in to like posts',
        subtitle: 'Log in from Profile to react to posts',
        icon: 'heart-dislike-outline',
      });
      return;
    }
    showToast({
      message: 'Could not save your like',
      subtitle: detail || 'Please try again',
      icon: 'heart-dislike-outline',
    });
  }

  function openCompose() {
    router.push('/(tabs)/community/new');
  }

  function showRulesLink() {
    showRules();
  }

  function toggleSavedView() {
    setSavedOnly((prev) => !prev);
  }

  function toggleBookmark(postId: string) {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleFollow(authorId: string) {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(authorId)) next.delete(authorId);
      else next.add(authorId);
      return next;
    });
  }

  function openMenu(post: FeedPost) {
    setMenuTarget(moderationTargetFromPost(post));
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
      onSuccess: () =>
        showToast({
          message: 'Author blocked',
          subtitle: 'Their posts are hidden from you',
          icon: 'ban-outline',
        }),
    });
  }

  function onModerationDelete() {
    if (!menuTarget || menuTarget.type !== 'post') return;
    deletePost.mutate(menuTarget.post.id);
  }

  const onPullRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setPullRefreshing(false);
    }
  }, [refetch]);

  const emptyMessage = savedOnly
    ? bookmarkedIds.size === 0
      ? 'Tap the bookmark on a post to save it here.'
      : 'No saved posts match your search.'
    : filter === 'mine'
      ? "You haven't posted yet. Tap New post to share with the community."
      : filter === 'following'
        ? followedIds.size === 0
          ? 'Follow people from post options to see them here.'
          : 'No recent posts from people you follow.'
        : searchQuery.trim()
          ? 'No posts match your search.'
          : 'Start the conversation — post anonymously if you prefer.';

  const bootstrapping = consentLoading || (Boolean(userId) && isFetching && posts.length === 0);

  const refreshControl =
    RN.RefreshControl != null ? (
      <RN.RefreshControl
        refreshing={pullRefreshing}
        onRefresh={() => void onPullRefresh()}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressBackgroundColor={colors.surface}
      />
    ) : undefined;

  if (bootstrapping && !isError) return <LoadingScreen />;

  if (isError) {
    const schemaMissing = isSchemaNotReadyError(error);
    return (
      <Screen>
        <ErrorState
          title={schemaMissing ? 'Community not set up yet' : "Couldn't load community"}
          message={
            schemaMissing
              ? schemaNotReadyMessage('Community')
              : 'Something went wrong loading posts. Check your connection and try again.'
          }
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen style={[styles.screen, styles.screenFullWidth]}>
      <CommunityConsentSheet visible={accepted === false} onAccept={() => void accept()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}>
        <CommunityFeedHeader
          filter={filter}
          onFilterChange={(next) => {
            setSavedOnly(false);
            setFilter(next);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userInitial={userInitial}
          onAvatarPress={() => router.push('/(tabs)/profile')}
          savedOnly={savedOnly}
          onToggleSaved={toggleSavedView}
        />

        {filteredPosts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              icon={savedOnly ? 'bookmark-outline' : 'chatbubbles-outline'}
              title={
                savedOnly
                  ? bookmarkedIds.size === 0
                    ? 'No saved posts yet'
                    : 'No matching saved posts'
                  : filter === 'following'
                    ? 'Nothing here yet'
                    : 'No posts yet'
              }
              message={emptyMessage}
              action={
                !savedOnly && filter !== 'following' ? (
                  <Button label="New post" onPress={openCompose} />
                ) : null
              }
            />
          </View>
        ) : (
          <View style={styles.postList}>
            {filteredPosts.map((item) => (
              <PostCard
                key={item.id}
                post={item}
                variant="feed"
                bookmarked={bookmarkedIds.has(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
                onPress={() =>
                  router.push({ pathname: '/(tabs)/community/post', params: { id: item.id } })
                }
                onToggleLike={() =>
                  like.mutate(
                    { postId: item.id, liked: item.likedByMe },
                    { onError: onLikeError },
                  )
                }
                onToggleDislike={() =>
                  dislike.mutate({ postId: item.id, disliked: item.dislikedByMe })
                }
                onMenu={() => openMenu(item)}
              />
            ))}
          </View>
        )}

        {filteredPosts.length > 0 ? (
          <Text style={[typography.caption, styles.footerDisclaimer, { color: colors.textFaint }]}>
            {COMMUNITY_DISCLAIMER}{' '}
            <Text style={{ color: colors.secondary }} onPress={showRulesLink}>
              Rules
            </Text>
          </Text>
        ) : null}
      </ScrollView>

      <CommunityComposeFab onPress={openCompose} />

      <CommunityModerationSheet
        target={menuTarget}
        isFollowing={menuTarget ? followedIds.has(authorIdFromTarget(menuTarget)) : false}
        onClose={() => setMenuTarget(null)}
        onFollow={() => {
          if (!menuTarget) return;
          const authorId = authorIdFromTarget(menuTarget);
          toggleFollow(authorId);
          showFollowToast(authorLabelFromTarget(menuTarget), true);
        }}
        onUnfollow={() => {
          if (!menuTarget) return;
          const authorId = authorIdFromTarget(menuTarget);
          toggleFollow(authorId);
          showFollowToast(authorLabelFromTarget(menuTarget), false);
        }}
        onReport={onModerationReport}
        onBlock={onModerationBlock}
        onDelete={menuTarget?.type === 'post' ? onModerationDelete : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
  },
  screenFullWidth: {
    paddingHorizontal: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: floatingTabBarScrollInset + spacing.xl,
  },
  postList: {
    backgroundColor: colors.surface,
  },
  emptyWrap: {
    minHeight: 320,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  footerDisclaimer: {
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});
