import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

const TRUST_ITEMS = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'You choose',
    body: 'Only share cycle, wellness, or trip info you enable.',
    tint: colors.tealTint,
    accent: colors.secondary,
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'Revoke anytime',
    body: 'Pause or disconnect — access ends immediately.',
    tint: colors.roseTint,
    accent: colors.primary,
  },
  {
    icon: 'heart-outline' as const,
    title: 'Support, not surveillance',
    body: 'Built for empathy and planning — never medical advice.',
    tint: '#F5E6FF',
    accent: '#9B6FD4',
  },
] as const;

/** Three quick-trust cards below the pairing timeline. */
export function PartnerTrustCards() {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
        YOUR PRIVACY
      </Text>
      <View style={styles.grid}>
        {TRUST_ITEMS.map((item) => (
          <View key={item.title} style={[styles.card, { backgroundColor: item.tint }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
              <Ionicons name={item.icon} size={18} color={item.accent} />
            </View>
            <Text style={[typography.captionMedium, { color: colors.text }]}>{item.title}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{item.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  sectionLabel: {
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    minWidth: '30%',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
