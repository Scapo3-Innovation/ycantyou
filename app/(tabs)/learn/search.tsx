import { useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListItem } from '@/components/ui/ListItem';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TextField } from '@/components/ui/TextField';
import { useSearchArticles } from '@/features/content/queries';
import { colors, spacing, typography } from '@/theme';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const term = query.trim();
  const { data: results = [], isFetching } = useSearchArticles(term);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Search" onBack={() => router.back()} />

        <TextField
          label="Search articles"
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. nutrition, mood, myths"
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />

        {term.length < 2 ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Type at least two letters to search titles and content.
          </Text>
        ) : isFetching ? null : results.length === 0 ? (
          <EmptyState icon="search-outline" title="No matches" message="Try another word." />
        ) : (
          <Card>
            {results.map((article, i) => (
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
