import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { DISCLAIMER_SHORT, REFERRAL } from '@/features/screener/constants';
import { colors, radius, spacing, typography } from '@/theme';

const INFO_ROWS = [
  {
    icon: 'time-outline' as const,
    title: 'About 2 minutes',
    body: 'A short checklist of signs commonly linked to PCOS.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Private to you',
    body: 'Your answers are used only for your screening result and report.',
  },
  {
    icon: 'medkit-outline' as const,
    title: 'Not a diagnosis',
    body: 'Results help you decide whether to speak with a clinician.',
  },
];

export function ScreenerIntroView() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: colors.roseTint }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="clipboard-outline" size={28} color={colors.primary} />
        </View>
        <Text style={[typography.h1, styles.heroTitle, { color: colors.text }]}>
          PCOS risk screener
        </Text>
        <Text style={[typography.body, styles.heroLead, { color: colors.textMuted }]}>
          Understand whether your signs may be worth discussing with a doctor — without replacing
          professional care.
        </Text>
      </View>

      <View style={styles.infoList}>
        {INFO_ROWS.map((row) => (
          <View key={row.title} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name={row.icon} size={20} color={colors.secondary} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{row.title}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{row.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
        <View style={styles.disclaimerCopy}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>
            {DISCLAIMER_SHORT}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{REFERRAL}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xl,
  },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroLead: {
    textAlign: 'center',
    maxWidth: 320,
  },
  infoList: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.roseTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  disclaimerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
