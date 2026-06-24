import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { DISCLAIMER_SHORT, REFERRAL } from '../constants';

/**
 * The mandatory, unmissable "not a diagnosis + see a clinician" banner.
 * Shown prominently on the result screen (and mirrored in the PDF).
 */
export function ResultDisclaimer() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return (
    <View style={[styles.card, { backgroundColor: c.danger, borderColor: c.danger }]}>
      <Text style={[typography.heading, { color: c.primaryText }]}>
        This is not a diagnosis
      </Text>
      <Text style={[typography.body, styles.body, { color: c.primaryText }]}>
        {DISCLAIMER_SHORT} {REFERRAL}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
  },
  body: {
    opacity: 0.95,
  },
});
