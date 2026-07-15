import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { colors, radius, typography } from '@/theme';

type ProfileGuestBannerProps = {
  onUpgrade: () => void;
};

/** Guest upgrade card — subscription-style CTA layout. */
export function ProfileGuestBanner({ onUpgrade }: ProfileGuestBannerProps) {
  return (
    <PremiumSection label="Account">
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconTile}>
            <Ionicons name="person-add-outline" size={COMPACT.iconGlyph} color={colors.secondary} />
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
    </PremiumSection>
  );
}

const COMPACT = {
  padH: 15,
  padV: 11,
  gap: 11,
  icon: 38,
  iconGlyph: 17,
  ctaPadH: 11,
  ctaPadV: 7,
} as const;

const styles = StyleSheet.create({
  card: {
    paddingVertical: COMPACT.padV,
    paddingHorizontal: COMPACT.padH,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: COMPACT.gap,
  },
  iconTile: {
    width: COMPACT.icon,
    height: COMPACT.icon,
    borderRadius: radius.sm,
    backgroundColor: colors.tealTint,
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
    paddingHorizontal: COMPACT.ctaPadH,
    paddingVertical: COMPACT.ctaPadV,
  },
  pressed: {
    opacity: 0.9,
  },
});
