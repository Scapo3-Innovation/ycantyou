import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItem } from '@/components/ui/ListItem';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useArticlesByCategory } from '@/features/content/queries';
import { spacing } from '@/theme';

export default function CategoryScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { data: articles = [], isLoading, isError, refetch } = useArticlesByCategory(id ?? '');

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader onBack={() => router.back()} />

        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : articles.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No articles yet"
            message="We're adding more here soon — check back."
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
