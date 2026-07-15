import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { CommunityComposeFab } from '@/features/community/components/CommunityComposeFab';
import { CommunityConsentSheet } from '@/features/community/components/CommunityConsentSheet';
import { CommunityFeedHeader } from '@/features/community/components/CommunityFeedHeader';
import { PostCard } from '@/features/community/components/PostCard';
import { COMMUNITY_DISCLAIMER, CONTENT_RULES, type FeedFilter } from '@/features/community/constants';
import { presentModerationMenu, presentReportReasons } from '@/features/community/moderation';
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
  const { data: posts, isLoading, isError, error, refetch, isFetching } = useFeed();
  const { accepted, accept, loading: consentLoading } = useCommunityConsent();
  const [filter, setFilter] = useState<FeedFilter>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set());
  const like = useToggleLike();
  const dislike = useToggleDislike();
  const report = useReport();
  const block = useBlockUser();
  const deletePost = useDeletePost();

  const userInitial = useMemo(() => {
    const name = profileFirstName(profile?.full_name);
    if (name === 'there') return 'Y';
    return name.charAt(0).toUpperCase();
  }, [profile?.full_name]);

  useEffect(() => {
    if (accepted) analytics.track('community_feed_opened');
  }, [accepted]);

  const filteredPosts = useMemo(() => {
    let list = [...(posts ?? [])];
    const q = searchQuery.trim().toLowerCase();

    if (filter === 'mine') {
      list = list.filter((p) => p.isOwn);
    } else if (filter === 'following') {
      list = [];
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
  }, [posts, filter, searchQuery]);

  function openCompose() {
    router.push('/(tabs)/community/new');
  }

  function showRules() {
    Alert.alert('Community rules', CONTENT_RULES);
  }

  function toggleBookmark(postId: string) {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function showBookmarkedPosts() {
    const saved = (posts ?? []).filter((p) => bookmarkedIds.has(p.id));
    if (saved.length === 0) {
      Alert.alert('Saved posts', 'Posts you bookmark will appear here during this session.');
      return;
    }
    Alert.alert(
      'Saved posts',
      saved.map((p) => p.body.slice(0, 80)).join('\n\n—\n\n'),
    );
  }

  function openMenu(post: FeedPost) {
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
          { text: 'Block', style: 'destructive', onPress: () => block.mutate(post.user_id) },
        ]),
      onDelete: () =>
        Alert.alert('Delete post', 'This removes your post for everyone.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deletePost.mutate(post.id) },
        ]),
    });
  }

  const emptyMessage =
    filter === 'mine'
      ? "You haven't posted yet. Tap New post to share with the community."
      : filter === 'following'
        ? 'Following is coming soon — you will see posts from people you follow here.'
        : searchQuery.trim()
          ? 'No posts match your search.'
          : 'Start the conversation — post anonymously if you prefer.';

  if (isLoading || consentLoading) return <LoadingScreen />;
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

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching && !isLoading}
        onRefresh={() => void refetch()}
        ListHeaderComponent={
          <CommunityFeedHeader
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userInitial={userInitial}
            onAvatarPress={() => router.push('/(tabs)/profile')}
            onBookmarksPress={showBookmarkedPosts}
            onNotificationsPress={() =>
              Alert.alert('Notifications', 'You have no new community notifications.')
            }
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="chatbubbles-outline"
              title={filter === 'following' ? 'Nothing here yet' : 'No posts yet'}
              message={emptyMessage}
            />
          </View>
        }
        ListFooterComponent={
          filteredPosts.length > 0 ? (
            <Text style={[typography.caption, styles.footerDisclaimer, { color: colors.textFaint }]}>
              {COMMUNITY_DISCLAIMER}{' '}
              <Text style={{ color: colors.secondary }} onPress={showRules}>
                Rules
              </Text>
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            variant="feed"
            bookmarked={bookmarkedIds.has(item.id)}
            onToggleBookmark={() => toggleBookmark(item.id)}
            onPress={() =>
              router.push({ pathname: '/(tabs)/community/post', params: { id: item.id } })
            }
            onToggleLike={() => like.mutate({ postId: item.id, liked: item.likedByMe })}
            onToggleDislike={() =>
              dislike.mutate({ postId: item.id, disliked: item.dislikedByMe })
            }
            onMenu={() => openMenu(item)}
          />
        )}
      />

      <CommunityComposeFab onPress={openCompose} />
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
  list: {
    paddingBottom: floatingTabBarScrollInset + spacing.lg,
    flexGrow: 1,
  },
  emptyWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  footerDisclaimer: {
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: floatingTabBarScrollInset,
  },
});
