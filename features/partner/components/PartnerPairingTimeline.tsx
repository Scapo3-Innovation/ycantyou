import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { PAIRING_STEPS, pairingStepIndex, type PairingStepId } from '../pairingSteps';

type PartnerPairingTimelineProps = {
  currentStep: PairingStepId;
};

/** Vertical “what happens next” timeline for partner linking. */
export function PartnerPairingTimeline({ currentStep }: PartnerPairingTimelineProps) {
  const activeIndex = pairingStepIndex(currentStep);

  return (
    <View style={styles.wrap}>
      <Text style={[typography.captionMedium, styles.sectionLabel, { color: colors.textMuted }]}>
        HOW IT WORKS
      </Text>

      <View style={styles.list}>
        {PAIRING_STEPS.map((step, index) => {
          const done = index < activeIndex;
          const current = index === activeIndex;
          const upcoming = index > activeIndex;

          return (
            <View key={step.id} style={styles.row}>
              <View style={styles.rail}>
                {index > 0 ? (
                  <View
                    style={[
                      styles.lineTop,
                      { backgroundColor: done || current ? colors.primary : colors.border },
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.node,
                    done && styles.nodeDone,
                    current && styles.nodeCurrent,
                    upcoming && styles.nodeUpcoming,
                  ]}>
                  {done ? (
                    <Ionicons name="checkmark" size={14} color={colors.secondaryText} />
                  ) : (
                    <Ionicons
                      name={step.icon}
                      size={16}
                      color={current ? colors.primaryText : colors.textMuted}
                    />
                  )}
                </View>
                {index < PAIRING_STEPS.length - 1 ? (
                  <View
                    style={[
                      styles.lineBottom,
                      { backgroundColor: done ? colors.primary : colors.border },
                    ]}
                  />
                ) : null}
              </View>

              <View style={[styles.copy, current && styles.copyCurrent]}>
                <Text
                  style={[
                    typography.bodyMedium,
                    { color: current ? colors.text : done ? colors.text : colors.textMuted },
                  ]}>
                  {step.title}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: current ? colors.textMuted : colors.textFaint },
                  ]}>
                  {step.body}
                </Text>
                {current ? (
                  <View style={[styles.nowBadge, { backgroundColor: colors.roseTint }]}>
                    <Text style={[typography.captionMedium, { color: colors.primary }]}>
                      You are here
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  sectionLabel: {
    letterSpacing: 0.6,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rail: {
    width: 32,
    alignItems: 'center',
  },
  lineTop: {
    width: 2,
    height: spacing.sm,
    borderRadius: 1,
  },
  lineBottom: {
    width: 2,
    flex: 1,
    minHeight: spacing.lg,
    borderRadius: 1,
  },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  nodeDone: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  nodeUpcoming: {
    backgroundColor: colors.surfaceAlt,
  },
  copy: {
    flex: 1,
    gap: 2,
    paddingBottom: spacing.md,
  },
  copyCurrent: {
    paddingBottom: spacing.sm,
  },
  nowBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
});
