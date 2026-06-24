import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Markdown } from '@/features/content/Markdown';
import { useToggleBookmark } from '@/features/content/mutations';
import { useArticle, useBookmarkIds } from '@/features/content/queries';
import { analytics } from '@/lib/analytics';
import { colors, radius, spacing } from '@/theme';

export default function ArticleScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? '');
  const { data: bookmarkIds = [] } = useBookmarkIds();
  const toggle = useToggleBookmark();

  // Funnel event when an article is viewed (slug is content, not health data).
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
              style={[styles.bookmark, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={colors.primary}
              />
            </Pressable>
          }
        />

        <View style={styles.body}>
          <Markdown body={article.body ?? ''} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  body: {
    paddingBottom: spacing.xl,
  },
  bookmark: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
