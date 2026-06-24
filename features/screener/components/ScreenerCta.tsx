import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/theme';

/** Dashboard entry point into the PCOS risk screener (the module's wedge feature). */
export function ScreenerCta({ onPress }: { onPress: () => void }) {
  const c = colors;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.primary }]}>
      <View style={styles.text}>
        <Text style={[typography.heading, { color: c.text }]}>PCOS risk screener</Text>
        <Text style={[typography.caption, { color: c.textMuted }]}>
          A short checklist to help decide if it’s worth seeing a clinician. Not a diagnosis.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={c.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
