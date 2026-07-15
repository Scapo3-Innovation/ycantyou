import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { partnerAssets } from '@/features/partner/assets';
import { colors, radius, spacing, typography } from '@/theme';

import { PartnerBrandTitle } from './PartnerBrandTitle';
import { PartnerPairingTimeline } from './PartnerPairingTimeline';
import { PartnerTrustCards } from './PartnerTrustCards';

type PartnerPairingIntroViewProps = {
  consentChecked: boolean;
  onToggleConsent: () => void;
  onGetCode: () => void;
  onOpenSharing: () => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
};

export function PartnerPairingIntroView({
  consentChecked,
  onToggleConsent,
  onGetCode,
  onOpenSharing,
  loading = false,
  disabled = false,
  error,
}: PartnerPairingIntroViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <HeroBanner
        image={partnerAssets.inviteHero}
        title="Invite your partner"
        subtitle="Help them understand and support your cycle — on your terms."
        compact
        topInset={insets.top}
        photoHeight={240}
        icon="heart-outline"
      />

      <View style={styles.body}>
        <PartnerBrandTitle />

        <PartnerPairingTimeline currentStep="generate" />

        <PartnerTrustCards />

        <View style={[styles.consentCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable
            onPress={onToggleConsent}
            style={styles.consentRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consentChecked }}>
            <Ionicons
              name={consentChecked ? 'checkbox' : 'square-outline'}
              size={22}
              color={colors.primary}
            />
            <Text style={[typography.body, styles.consentText, { color: colors.text }]}>
              I understand my partner will see only what I enable, and I can revoke access anytime.
            </Text>
          </Pressable>
        </View>

        {error ? (
          <Text style={[typography.caption, styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}

        <Button
          label={loading ? 'Generating…' : 'Get pairing code'}
          onPress={onGetCode}
          disabled={loading || disabled || !consentChecked}
          style={styles.primaryButton}
        />

        <Text style={[typography.captionLight, styles.privacy]}>
          Your personal data is important. Only share it with a trusted, responsible partner.
        </Text>

        <Pressable
          onPress={onOpenSharing}
          accessibilityRole="button"
          style={styles.secondaryWrap}>
          <Ionicons name="options-outline" size={18} color={colors.secondary} />
          <Text style={[typography.bodyMedium, styles.secondaryLink, { color: colors.secondary }]}>
            Preview sharing preferences
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  body: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  consentCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  consentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  consentText: {
    flex: 1,
  },
  error: {
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: radius.full,
  },
  privacy: {
    color: colors.textFaint,
    textAlign: 'center',
  },
  secondaryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  secondaryLink: {},
});
