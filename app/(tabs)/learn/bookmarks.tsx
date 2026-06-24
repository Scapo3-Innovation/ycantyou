import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListItem } from '@/components/ui/ListItem';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useBookmarkedArticles } from '@/features/content/queries';
import { spacing } from '@/theme';

export default function BookmarksScreen() {
  const router = useRouter();
  const { data: articles = [], isLoading } = useBookmarkedArticles();

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Saved articles" onBack={() => router.back()} />

        {articles.length === 0 ? (
          <EmptyState
            icon="bookmark-outline"
            title="No saved articles yet"
            message="Tap the bookmark on any article to save it here."
          />
        ) : (
          <Card>
            {articles.map((article, i) => (
              <Fragment key={article.id}>
                {i > 0 ? <Divider /> : null}
                <ListItem
                  title={article.title}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/learn/article',
                      params: { slug: article.slug },
                    })
                  }
                />
              </Fragment>
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
