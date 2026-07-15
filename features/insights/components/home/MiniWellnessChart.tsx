import { StyleSheet, Text, View } from 'react-native';

import type { WeekPoint } from '@/features/insights/wellnessTrend';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

const CHART_HEIGHT = 72;
const CHART_WIDTH = 128;

type MiniWellnessChartProps = {
  points: WeekPoint[];
};

/** Simple dot-and-line wellness trend — no SVG dependency. */
export function MiniWellnessChart({ points }: MiniWellnessChartProps) {
  if (points.length === 0) return null;

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? CHART_WIDTH / 2 : (i / (points.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - (p.score / 100) * CHART_HEIGHT;
    return { ...p, x, y };
  });

  return (
    <View style={styles.wrap}>
      <View style={[styles.plot, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        {[0, 50, 100].map((tick) => (
          <View
            key={tick}
            style={[
              styles.gridLine,
              { top: CHART_HEIGHT - (tick / 100) * CHART_HEIGHT },
            ]}
          />
        ))}

        {coords.slice(1).map((point, i) => {
          const prev = coords[i];
          if (!prev) return null;
          const dx = point.x - prev.x;
          const dy = point.y - prev.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`line-${point.label}`}
              style={[
                styles.line,
                {
                  width: length,
                  left: prev.x,
                  top: prev.y,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {coords.map((point) => (
          <View
            key={point.label}
            style={[
              styles.dot,
              { left: point.x - 5, top: point.y - 5 },
            ]}
          />
        ))}
      </View>

      <View style={[styles.axis, { width: CHART_WIDTH }]}>
        {coords.map((point) => (
          <Text key={point.label} style={[typography.caption, styles.axisLabel]}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  plot: {
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.secondary,
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    color: colors.textFaint,
    fontSize: 10,
  },
});
