import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TourAnchor } from '@/features/tour/TourAnchor';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type CommunityComposeFabProps = {
  onPress: () => void;
};

/** Centered pill — Flo-style "New post" above the tab bar. */
export function CommunityComposeFab({ onPress }: CommunityComposeFabProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <TourAnchor id="tour-community-compose">
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="New post"
          style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
          <Ionicons name="create-outline" size={20} color={colors.primaryText} />
          <Text style={[typography.button, styles.label]}>New post</Text>
        </Pressable>
      </TourAnchor>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    minWidth: 160,
    justifyContent: 'center',
    ...shadows.card,
  },
  label: {
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
