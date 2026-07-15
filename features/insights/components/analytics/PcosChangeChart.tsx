import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { analyticsTypography } from '@/features/insights/components/analytics/analyticsStyles';
import { normalizeScreenerScore, type PcosTrendPoint } from '@/features/insights/pcosTrend';
import { RISK_BAND_LABEL } from '@/features/screener/constants';
import { colors, fontFamily, radius, spacing } from '@/theme';

const CHART_HEIGHT = 108;

type PcosChangeChartProps = {
  points: PcosTrendPoint[];
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
};

function hapticTap() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

function barValue(point: PcosTrendPoint): number {
  if (point.screenerScore != null) return normalizeScreenerScore(point.screenerScore);
  return point.signLoad ?? 0;
}

function barColor(point: PcosTrendPoint, selected: boolean): string {
  if (point.screenerBand === 'high') return colors.danger;
  if (point.screenerBand === 'moderate') return colors.warning;
  if (point.screenerScore != null) return colors.success;
  if (point.signLoad == null) return colors.border;
  return selected ? colors.primary : colors.roseTint;
}

/** Interactive PCOS / PCOD sign-load chart from logs and screener history. */
export function PcosChangeChart({ points, selectedIndex, onSelectIndex }: PcosChangeChartProps) {
  const hasData = points.some(
    (point) => point.signLoad != null || point.screenerScore != null,
  );

  if (!hasData) {
    return (
      <Text style={[analyticsTypography.body, { color: colors.textMuted }]}>
        Log mood, energy, or flow — or take the PCOS screener — to see how related signs change.
      </Text>
    );
  }

  const maxValue = Math.max(100, ...points.map(barValue));

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { height: CHART_HEIGHT }]}>
        {points.map((point, index) => {
          const selected = selectedIndex === index;
          const value = barValue(point);
          const hasValue = point.signLoad != null || point.screenerScore != null;
          const barHeight = hasValue ? Math.max(8, (value / maxValue) * CHART_HEIGHT) : 6;

          return (
            <Pressable
              key={point.key}
              onPress={() => {
                hapticTap();
                onSelectIndex(selected ? null : index);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${point.label}, PCOS sign trend`}
              style={({ pressed }) => [styles.barCol, pressed && styles.pressed]}>
              <View style={styles.barTrack}>
                {point.screenerScore != null ? (
                  <View style={[styles.screenerTag, { backgroundColor: barColor(point, selected) }]}>
                    <Text style={[analyticsTypography.micro, styles.screenerTagText]}>S</Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barColor(point, selected),
                      opacity: selected || selectedIndex == null ? 1 : 0.5,
                    },
                    selected && styles.barSelected,
                  ]}
                />
              </View>
              <Text
                style={[
                  analyticsTypography.micro,
                  styles.label,
                  { color: selected ? colors.text : colors.textFaint },
                ]}
                numberOfLines={1}>
                {point.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <LegendDot color={colors.primary} label="Sign load from logs" />
        <LegendDot color={colors.success} label="Screener result" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[analyticsTypography.micro, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export function PcosChangeDetail({ point }: { point: PcosTrendPoint | null }) {
  if (!point) return null;

  return (
    <View style={styles.detail}>
      <Text style={[analyticsTypography.bodyMedium, { color: colors.text }]}>
        {point.dateStart === point.dateEnd
          ? point.label
          : `${point.label} period`}
      </Text>
      <View style={styles.metrics}>
        <Metric label="Sign load" value={point.signLoad == null ? '—' : `${point.signLoad}%`} />
        <Metric label="Stress days" value={String(point.stressDays)} />
        <Metric label="Low energy" value={String(point.fatigueDays)} />
        <Metric label="Heavy flow" value={String(point.heavyFlowDays)} />
      </View>
      {point.screenerScore != null && point.screenerBand ? (
        <Text style={[analyticsTypography.body, { color: colors.textMuted }]}>
          Screener: score {point.screenerScore}/{22} · {RISK_BAND_LABEL[point.screenerBand]}
        </Text>
      ) : null}
      <Text style={[analyticsTypography.micro, { color: colors.textFaint }]}>
        Screening tool only — not a diagnosis.
      </Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[analyticsTypography.micro, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[analyticsTypography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    width: '100%',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '72%',
    borderRadius: radius.sm,
    minHeight: 6,
  },
  barSelected: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  screenerTag: {
    position: 'absolute',
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenerTagText: {
    color: colors.primaryText,
    fontFamily: fontFamily.semibold,
    fontSize: 9,
    lineHeight: 11,
  },
  label: {
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detail: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    minWidth: '42%',
    gap: 2,
  },
  pressed: {
    opacity: 0.92,
  },
});
