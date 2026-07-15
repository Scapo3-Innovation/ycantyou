import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TourAnchor } from '@/features/tour/TourAnchor';
import { colors, FLOATING_TAB_BAR_HEIGHT, shadows, spacing } from '@/theme';

type CommunityComposeFabProps = {
  onPress: () => void;
};

/** Circular compose button — primary outline on the right, above the tab bar. */
export function CommunityComposeFab({ onPress }: CommunityComposeFabProps) {
  const insets = useSafeAreaInsets();
  const bottom =
    Math.max(insets.bottom, spacing.sm) + FLOATING_TAB_BAR_HEIGHT + spacing.md;

  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <TourAnchor id="tour-community-compose">
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="New post"
          style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
          <Ionicons name="add" size={28} color={colors.primary} />
        </Pressable>
      </TourAnchor>
    </View>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.glass,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
});
