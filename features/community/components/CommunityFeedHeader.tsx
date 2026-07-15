import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { FeedFilter } from '@/features/community/constants';
import { colors, radius, spacing, typography } from '@/theme';

type CommunityFeedHeaderProps = {
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userInitial: string;
  onAvatarPress: () => void;
  savedOnly: boolean;
  onToggleSaved: () => void;
};

const FILTERS: {
  id: FeedFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'popular', label: 'Popular', icon: 'trending-up-outline', activeIcon: 'trending-up' },
  { id: 'mine', label: 'Mine', icon: 'person-outline', activeIcon: 'person' },
  { id: 'following', label: 'Following', icon: 'people-outline', activeIcon: 'people' },
];

export function CommunityFeedHeader({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  userInitial,
  onAvatarPress,
  savedOnly,
  onToggleSaved,
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

        <Pressable
          onPress={onToggleSaved}
          accessibilityRole="button"
          accessibilityLabel={savedOnly ? 'Show all posts' : 'Show saved posts'}
          accessibilityState={{ selected: savedOnly }}
          hitSlop={8}
          style={[styles.savedBtn, savedOnly && styles.savedBtnActive]}>
          <Ionicons
            name={savedOnly ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={savedOnly ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.filterRow} accessibilityRole="tablist">
        {FILTERS.map(({ id, label, icon, activeIcon }) => {
          const selected = filter === id;
          return (
            <Pressable
              key={id}
              onPress={() => onFilterChange(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.filterChip,
                selected ? styles.filterChipActive : styles.filterChipIdle,
                pressed && styles.filterChipPressed,
              ]}>
              <Ionicons
                name={selected ? activeIcon : icon}
                size={13}
                color={selected ? colors.primaryText : colors.textMuted}
              />
              <Text
                style={[
                  styles.filterLabel,
                  { color: selected ? colors.primaryText : colors.textMuted },
                ]}
                numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
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
  savedBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  savedBtnActive: {
    backgroundColor: colors.roseTint,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 7,
    borderRadius: radius.full,
    minHeight: 32,
  },
  filterChipIdle: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  filterChipPressed: {
    opacity: 0.88,
  },
  filterLabel: {
    ...typography.captionMedium,
    fontSize: 11,
    lineHeight: 14,
  },
});
