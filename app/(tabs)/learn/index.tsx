import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListItem } from '@/components/ui/ListItem';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON } from '@/features/content/constants';
import { useCategories } from '@/features/content/queries';
import { colors, radius, spacing, typography } from '@/theme';

export default function LearnScreen() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useCategories();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Learn" subtitle="Plain-language guides about PCOS and your health." />

        <Pressable
          onPress={() => router.push('/(tabs)/learn/search')}
          accessibilityRole="button"
          accessibilityLabel="Search articles"
          style={[styles.searchBar, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.textMuted }]}>Search articles</Text>
        </Pressable>

        <ListItem
          title="Saved articles"
          subtitle="Your bookmarks"
          leftIcon="bookmark-outline"
          onPress={() => router.push('/(tabs)/learn/bookmarks')}
        />

        <SectionHeader title="Topics" />

        {isLoading ? null : categories.length === 0 ? (
          <EmptyState icon="book-outline" title="No topics yet" message="Check back soon." />
        ) : (
          <Card>
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
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    borderWidth: 1,
  },
});
