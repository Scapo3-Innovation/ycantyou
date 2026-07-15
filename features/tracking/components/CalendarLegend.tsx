import type { ReactNode } from 'react';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarLegendInfoModal } from '@/features/tracking/components/CalendarLegendInfoModal';
import { colors, spacing, typography } from '@/theme';

function LegendItem({
  label,
  swatch,
}: {
  label: string;
  swatch: ReactNode;
}) {
  return (
    <View style={styles.legendItem}>
      {swatch}
      <Text style={[typography.caption, styles.legendText, { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

function SolidSwatch({ color }: { color: string }) {
  return <View style={[styles.legendSwatch, { backgroundColor: color }]} />;
}

function DashedSwatch({ color }: { color: string }) {
  return (
    <View
      style={[
        styles.legendSwatch,
        {
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: color,
        },
      ]}
    />
  );
}

function TextSwatch({ color }: { color: string }) {
  return (
    <Text style={[typography.captionMedium, { color, lineHeight: 14 }]}>12</Text>
  );
}

type CalendarLegendProps = {
  view?: 'month' | 'year';
};

/** Shared calendar colour key — aligned row for month and year views. */
export function CalendarLegend({ view = 'month' }: CalendarLegendProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <View style={styles.legendRow}>
        <View style={styles.legendItems}>
          {view === 'month' ? (
            <>
              <LegendItem label="Period" swatch={<SolidSwatch color={colors.primary} />} />
              <LegendItem label="Fertile (est.)" swatch={<TextSwatch color={colors.secondary} />} />
              <LegendItem
                label="Selected"
                swatch={<DashedSwatch color={colors.secondary} />}
              />
            </>
          ) : (
            <>
              <LegendItem label="Period" swatch={<DashedSwatch color={colors.primary} />} />
              <LegendItem label="Fertile (est.)" swatch={<DashedSwatch color={colors.secondary} />} />
              <LegendItem label="Next period (est.)" swatch={<TextSwatch color={colors.secondary} />} />
            </>
          )}
        </View>
        <Pressable
          onPress={() => setInfoOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Calendar legend info"
          hitSlop={8}
          style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <CalendarLegendInfoModal
        visible={infoOpen}
        view={view}
        onClose={() => setInfoOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  legendItems: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    lineHeight: 14,
  },
  infoBtn: {
    alignSelf: 'center',
  },
});
