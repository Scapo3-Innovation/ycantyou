import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

/** Badge for members who consistently give helpful replies — not a medical verification. */
export function TrustedBadge() {
  return (
    <View style={styles.badge} accessibilityLabel="Helpful member">
      <Ionicons name="shield-checkmark" size={12} color={colors.secondary} />
      <Text style={[typography.caption, styles.label, { color: colors.secondary }]}>
        Helpful member
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.tealTint,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
});
