import { useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ContentRules } from '@/features/community/components/ContentRules';
import { PostCard } from '@/features/community/components/PostCard';
import { presentModerationMenu, presentReportReasons } from '@/features/community/moderation';
import {
  useBlockUser,
  useDeletePost,
  useReport,
  useToggleLike,
} from '@/features/community/mutations';
import { useFeed } from '@/features/community/queries';
import type { FeedPost } from '@/features/community/types';
import { spacing } from '@/theme';

export default function CommunityScreen() {
  const router = useRouter();
  const { data: posts, isLoading, isError, refetch } = useFeed();
  const like = useToggleLike();
  const report = useReport();
  const block = useBlockUser();
  const deletePost = useDeletePost();

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

  if (isLoading) return <LoadingScreen />;
  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Community" subtitle="A supportive space — you're not alone." />
            <ContentRules />
            <Button
              label="New post"
              leftIcon="create-outline"
              onPress={() => router.push('/(tabs)/community/new')}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No posts yet"
            message="Be the first to share something supportive."
          />
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push({ pathname: '/(tabs)/community/post', params: { id: item.id } })}
            onToggleLike={() => like.mutate({ postId: item.id, liked: item.likedByMe })}
            onMenu={() => openMenu(item)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    gap: spacing.lg,
  },
});
