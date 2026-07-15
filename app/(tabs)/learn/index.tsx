import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ListItem } from '@/components/ui/ListItem';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/features/content/constants';
import { useCategories } from '@/features/content/queries';
import { colors, radius, fullScreenScrollContent, spacing, typography } from '@/theme';

export default function LearnScreen() {
  const router = useRouter();
  const { data: categories = [], isLoading, isError, refetch } = useCategories();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Learn"
          subtitle="Plain-language guides about PCOS and your health."
        />

        <Pressable
          onPress={() => router.push('/(tabs)/learn/search')}
          accessibilityRole="button"
          accessibilityLabel="Search articles"
          style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.secondary} />
          <Text style={[typography.body, { color: colors.textMuted }]}>Search articles</Text>
        </Pressable>

        <Card style={styles.listCard}>
          <ListItem
            title="Saved articles"
            subtitle="Your bookmarks"
            leftIcon="bookmark-outline"
            onPress={() => router.push('/(tabs)/learn/bookmarks')}
          />
        </Card>

        <SectionHeader title="Topics" />

        {isLoading ? null : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : categories.length === 0 ? (
          <EmptyState icon="book-outline" title="No topics yet" message="Check back soon." />
        ) : (
          <Card style={styles.listCard}>
            {categories.map((category, i) => (
              <Fragment key={category.id}>
                {i > 0 ? <Divider /> : null}
                <ListItem
                  title={category.name}
                  leftIcon={CATEGORY_ICONS[category.slug] ?? DEFAULT_CATEGORY_ICON}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/learn/category',
                      params: { id: category.id, name: category.name },
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
  scroll: fullScreenScrollContent,
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
});
