import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing, typography } from '@/theme';
import type { PartnerSharingSettings } from '@/types/database';

import { formatCycleStateLabel } from '../insights/supportTips';

type PartnerPreviewPanelProps = {
  settings: PartnerSharingSettings;
  primaryName?: string;
};

/** Shows what a partner would see given current sharing toggles. */
export function PartnerPreviewPanel({ settings, primaryName = 'Her' }: PartnerPreviewPanelProps) {
  const samplePhase = { kind: 'period' as const, day: 2 };
  const phaseLabel = settings.cycle_phase ? formatCycleStateLabel(samplePhase) : null;

  const lines: string[] = [];
  if (phaseLabel) lines.push(phaseLabel);
  if (settings.predictions) lines.push('Next period estimate: ~12 Aug');
  if (settings.period_dates) lines.push('Logged period days on calendar');
  if (settings.fertile_window) lines.push('Estimated fertile window (not contraception)');
  if (settings.mood_energy_summary) lines.push('Today: Good mood · Low energy');
  if (settings.symptoms_summary) lines.push('Today: Bloating, Fatigue');
  if (settings.screener_summary) lines.push('PCOS screener: moderate risk band');
  if (settings.daily_notes) lines.push('Daily notes (if any)');

  return (
    <Card style={styles.card}>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
        PREVIEW · WHAT {primaryName.toUpperCase()}&apos;S PARTNER WOULD SEE
      </Text>
      {lines.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Nothing shared yet — turn on at least one toggle.
        </Text>
      ) : (
        lines.map((line) => (
          <View key={line} style={styles.line}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[typography.body, { color: colors.text }]}>{line}</Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
