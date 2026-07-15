import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';

type CalendarLegendInfoModalProps = {
  visible: boolean;
  view: 'month' | 'year';
  onClose: () => void;
};

type InfoRowProps = {
  swatch: ReactNode;
  title: string;
  description: string;
};

function InfoRow({ swatch, title, description }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.swatchWrap}>{swatch}</View>
      <View style={styles.rowCopy}>
        <Text style={[typography.captionMedium, { color: colors.text }]}>{title}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{description}</Text>
      </View>
    </View>
  );
}

function SolidSwatch({ color }: { color: string }) {
  return <View style={[styles.solidSwatch, { backgroundColor: color }]} />;
}

function DashedSwatch({ color }: { color: string }) {
  return (
    <View style={[styles.dashedSwatch, { borderColor: color }]}>
      <Text style={[typography.captionMedium, { color, lineHeight: 14 }]}>12</Text>
    </View>
  );
}

function TextSwatch({ color }: { color: string }) {
  return (
    <View style={styles.textSwatchWrap}>
      <Text style={[typography.captionMedium, { color, lineHeight: 16 }]}>12</Text>
    </View>
  );
}

/** Themed calendar legend explainer — replaces the system alert. */
export function CalendarLegendInfoModal({ visible, view, onClose }: CalendarLegendInfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={[typography.h2, styles.title, { color: colors.text }]}>Calendar key</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            How to read your cycle calendar
          </Text>

          <View style={styles.rows}>
            {view === 'month' ? (
              <>
                <InfoRow
                  swatch={<SolidSwatch color={colors.primary} />}
                  title="Period"
                  description="Days you have logged bleeding."
                />
                <InfoRow
                  swatch={<TextSwatch color={colors.secondary} />}
                  title="Fertile window (est.)"
                  description="Estimated fertile days for regular cycles only."
                />
                <InfoRow
                  swatch={<DashedSwatch color={colors.secondary} />}
                  title="Selected"
                  description="The day you are viewing or editing."
                />
              </>
            ) : (
              <>
                <InfoRow
                  swatch={<DashedSwatch color={colors.primary} />}
                  title="Period"
                  description="Logged period days shown with a dashed pink ring."
                />
                <InfoRow
                  swatch={<DashedSwatch color={colors.secondary} />}
                  title="Fertile window (est.)"
                  description="Estimated fertile days for regular cycles only."
                />
                <InfoRow
                  swatch={<TextSwatch color={colors.secondary} />}
                  title="Next period (est.)"
                  description="Estimated next period window in teal text."
                />
              </>
            )}
          </View>

          <Text style={[typography.caption, styles.disclaimer, { color: colors.textFaint }]}>
            Estimates are not certainties and are not a diagnosis or contraception method.
          </Text>

          <Button label="Got it" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const SWATCH_SIZE = 28;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.45)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  rows: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  swatchWrap: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  solidSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dashedSwatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSwatchWrap: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    lineHeight: 18,
  },
});
