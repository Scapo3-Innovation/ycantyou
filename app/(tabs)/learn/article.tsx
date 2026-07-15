import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Markdown } from '@/features/content/Markdown';
import { useToggleBookmark } from '@/features/content/mutations';
import { useArticle, useBookmarkIds } from '@/features/content/queries';
import { analytics } from '@/lib/analytics';
import { colors, radius, fullScreenScrollContent } from '@/theme';

export default function ArticleScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? '');
  const { data: bookmarkIds = [] } = useBookmarkIds();
  const toggle = useToggleBookmark();

  useEffect(() => {
    if (article) analytics.track('article_opened', { slug: article.slug });
  }, [article]);

  if (isLoading) return <LoadingScreen />;

  if (!article) {
    return (
      <Screen>
        <EmptyState
          icon="document-text-outline"
          title="Article not found"
          message="It may have moved or is not available."
        />
      </Screen>
    );
  }

  const bookmarked = bookmarkIds.includes(article.id);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={article.title}
          onBack={() => router.back()}
          right={
            <Pressable
              onPress={() => toggle.mutate({ articleId: article.id, bookmarked })}
              accessibilityRole="button"
              accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Save article'}
              hitSlop={8}
              style={[styles.bookmark, { backgroundColor: colors.roseTint }]}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={colors.primary}
              />
            </Pressable>
          }
        />

        <Card>
          <Markdown body={article.body ?? ''} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: fullScreenScrollContent,
  bookmark: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
