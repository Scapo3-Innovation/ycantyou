import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { FeedFilter } from '@/features/community/constants';
import { colors, radius, spacing, typography } from '@/theme';

type CommunityFeedHeaderProps = {
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userInitial: string;
  onAvatarPress: () => void;
  onBookmarksPress: () => void;
  onNotificationsPress: () => void;
};

const FILTERS: { id: FeedFilter; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'mine', label: 'My posts' },
  { id: 'following', label: 'Following' },
];

export function CommunityFeedHeader({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  userInitial,
  onAvatarPress,
  onBookmarksPress,
  onNotificationsPress,
}: CommunityFeedHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topBar}>
        <Pressable
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.roseTint }]}>
            <Text style={[typography.bodyMedium, { color: colors.primary }]}>{userInitial}</Text>
          </View>
          <View style={styles.avatarDot} />
        </Pressable>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search"
            placeholderTextColor={colors.textFaint}
            style={[typography.body, styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.iconRow}>
          <Pressable
            onPress={onBookmarksPress}
            accessibilityRole="button"
            accessibilityLabel="Saved posts"
            hitSlop={8}
            style={styles.iconBtn}>
            <Ionicons name="bookmark-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={onNotificationsPress}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={8}
            style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {FILTERS.map(({ id, label }) => {
          const selected = filter === id;
          return (
            <Pressable
              key={id}
              onPress={() => onFilterChange(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[
                styles.filterPill,
                selected ? styles.filterPillActive : styles.filterPillIdle,
              ]}>
              <Text
                style={[
                  typography.captionMedium,
                  { color: selected ? colors.primaryText : colors.textMuted },
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  searchWrap: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillIdle: {
    backgroundColor: colors.surfaceAlt,
  },
});
