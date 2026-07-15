import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PremiumSection, PremiumSectionLabel } from '@/components/ui/PremiumSection';
import { colors, radius, spacing, typography } from '@/theme';

type SettingsSectionProps = {
  label: string;
  children: ReactNode;
};

/** Settings group — premium uppercase label + stacked rows. */
export function SettingsSection({ label, children }: SettingsSectionProps) {
  return <PremiumSection label={label}>{children}</PremiumSection>;
}

type SettingsPrivacyHeroProps = {
  title: string;
  body: string;
};

/** Privacy promise banner at the top of Settings. */
export function SettingsPrivacyHero({ title, body }: SettingsPrivacyHeroProps) {
  return (
    <Card style={styles.hero}>
      <View style={styles.heroIcon}>
        <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
      </View>
      <View style={styles.heroCopy}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{title}</Text>
        <Text style={[typography.caption, styles.heroBody, { color: colors.textMuted }]}>{body}</Text>
      </View>
    </Card>
  );
}

export { PremiumSectionLabel };

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.tealTint,
    borderColor: 'rgba(59, 169, 156, 0.18)',
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroBody: {
    lineHeight: 18,
  },
});
