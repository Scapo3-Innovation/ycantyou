import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { partnerAssets } from '@/features/partner/assets';
import { colors, radius, spacing, typography } from '@/theme';

import { PartnerBrandTitle } from './PartnerBrandTitle';
import { PartnerPairingTimeline } from './PartnerPairingTimeline';

type PartnerPairingCodeViewProps = {
  code: string;
  expiresAt: string;
  onSendCode: () => void;
  onCancelInvite: () => void;
  cancelPending?: boolean;
};

export function PartnerPairingCodeView({
  code,
  expiresAt,
  onSendCode,
  onCancelInvite,
  cancelPending = false,
}: PartnerPairingCodeViewProps) {
  const insets = useSafeAreaInsets();

  function confirmCancel() {
    Alert.alert(
      'Cancel invite?',
      'Your partner will no longer be able to use this code. You can generate a new one anytime.',
      [
        { text: 'Keep code', style: 'cancel' },
        { text: 'Cancel invite', style: 'destructive', onPress: onCancelInvite },
      ],
    );
  }

  const expiryLabel = new Date(expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' });

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <HeroBanner
        image={partnerAssets.shareHero}
        title="Share your code"
        subtitle="Send it to someone you trust — they'll enter it when signing up."
        compact
        topInset={insets.top}
        photoHeight={220}
        icon="paper-plane-outline"
      />

      <View style={styles.body}>
        <PartnerBrandTitle />

        <View style={[styles.codeSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.captionMedium, styles.codeLabel, { color: colors.textMuted }]}>
            YOUR PAIRING CODE
          </Text>
          <View style={styles.codeBox} accessibilityLabel={`Pairing code ${code}`}>
            <Text style={styles.code}>{code}</Text>
          </View>
          <View style={styles.expiryRow}>
            <Ionicons name="time-outline" size={14} color={colors.textFaint} />
            <Text style={[typography.caption, { color: colors.textFaint }]}>
              Expires {expiryLabel}
            </Text>
          </View>
          <Button label="Send pairing code" onPress={onSendCode} style={styles.sendButton} />
        </View>

        <PartnerPairingTimeline currentStep="share" />

        <View style={[styles.tipCard, { backgroundColor: colors.tealTint }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.secondary} />
          <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>
            After they join, open{' '}
            <Text style={typography.captionMedium}>Sharing preferences</Text> to choose exactly what
            they can see.
          </Text>
        </View>

        <Text style={[typography.captionLight, styles.privacy]}>
          Your personal data is important. Only share it with a trusted, responsible partner.
        </Text>

        <Pressable
          onPress={confirmCancel}
          disabled={cancelPending}
          accessibilityRole="button"
          accessibilityState={{ disabled: cancelPending }}
          style={styles.cancelWrap}>
          <Text style={[typography.body, styles.cancel, cancelPending && styles.cancelDisabled]}>
            {cancelPending ? 'Cancelling…' : 'Cancel invite'}
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
  codeSection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  codeLabel: {
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  code: {
    ...typography.display,
    color: colors.text,
    letterSpacing: 8,
    fontVariant: ['tabular-nums'],
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  sendButton: {
    borderRadius: radius.full,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  privacy: {
    color: colors.textFaint,
    textAlign: 'center',
  },
  cancelWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancel: {
    color: colors.textMuted,
  },
  cancelDisabled: {
    opacity: 0.5,
  },
});
