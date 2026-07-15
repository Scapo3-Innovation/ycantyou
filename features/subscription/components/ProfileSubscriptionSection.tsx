import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PremiumSection } from '@/components/ui/PremiumSection';
import { PREMIUM_PLANS, PREMIUM_TRIAL_DAYS } from '@/features/subscription/constants';
import { colors, radius, typography } from '@/theme';

type ProfileSubscriptionSectionProps = {
  onExplorePremium: () => void;
};

const yearlyPlan = PREMIUM_PLANS.find((plan) => plan.id === 'yearly');

/** Subscription row — current plan summary with explore-premium CTA. */
export function ProfileSubscriptionSection({ onExplorePremium }: ProfileSubscriptionSectionProps) {
  return (
    <PremiumSection label="Subscription">
      <Card style={styles.card}>
        <Pressable
          onPress={onExplorePremium}
          accessibilityRole="button"
          accessibilityLabel="Explore Premium subscription"
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.iconTile}>
            <Ionicons name="ribbon-outline" size={COMPACT.iconGlyph} color={colors.primary} />
          </View>

          <View style={styles.copy}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>Free plan</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Try Premium free for {PREMIUM_TRIAL_DAYS} days, then {yearlyPlan?.price}/yr
            </Text>
          </View>

          <View style={styles.cta}>
            <Text style={[typography.captionMedium, { color: colors.primaryText }]}>Explore</Text>
          </View>
        </Pressable>
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
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: COMPACT.ctaPadH,
    paddingVertical: COMPACT.ctaPadV,
  },
  pressed: {
    opacity: 0.92,
  },
});
