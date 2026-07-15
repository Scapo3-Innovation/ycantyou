import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';

type ProfileGuestBannerProps = {
  onUpgrade: () => void;
};

/** Guest upgrade card — premium CTA layout. */
export function ProfileGuestBanner({ onUpgrade }: ProfileGuestBannerProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconTile}>
          <Ionicons name="person-add-outline" size={18} color={colors.secondary} />
        </View>
        <View style={styles.copy}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Guest account</Text>
          <Text style={[typography.caption, styles.body, { color: colors.textMuted }]}>
            Link an email to keep your data safe and sync across devices.
          </Text>
        </View>
        <Pressable
          onPress={onUpgrade}
          accessibilityRole="button"
          accessibilityLabel="Upgrade — link an email"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={[typography.captionMedium, { color: colors.primaryText }]}>Upgrade</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tealTint,
    borderColor: 'rgba(59, 169, 156, 0.18)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  body: {
    lineHeight: 18,
  },
  cta: {
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
