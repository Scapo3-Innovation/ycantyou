import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dailyLogSummaryChips } from '@/features/tracking/dailyLogSummary';
import type { DayStatus } from '@/features/tracking/periodStatus';
import type { DailyLogWithSymptoms } from '@/types/database';
import { colors, radius, spacing, typography } from '@/theme';

type TrackTodayStatusCardProps = {
  status: DayStatus;
  todayLog?: DailyLogWithSymptoms | null;
  onOpenDay: () => void;
  onLogDetails: () => void;
  onLogPeriod: () => void;
  showLogDetails?: boolean;
  showLogPeriod?: boolean;
};

/** Pink today card with period status and quick log actions. */
export function TrackTodayStatusCard({
  status,
  todayLog,
  onOpenDay,
  onLogDetails,
  onLogPeriod,
  showLogDetails = true,
  showLogPeriod = true,
}: TrackTodayStatusCardProps) {
  const showActions = showLogDetails || showLogPeriod;
  const logChips = todayLog ? dailyLogSummaryChips(todayLog) : [];

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onOpenDay}
        accessibilityRole="button"
        style={({ pressed }) => [styles.statusRow, pressed && styles.pressed]}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={status.isPeriod ? 'water' : 'calendar-outline'}
            size={22}
            color={colors.primary}
          />
        </View>
        <View style={styles.statusCopy}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{status.heading}</Text>
          <Text style={[typography.bodyMedium, { color: colors.primary }]}>{status.title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </Pressable>

      {logChips.length > 0 ? (
        <View style={styles.chipRow}>
          {logChips.map((chip) => (
              <View
                key={`${chip.label}-${chip.icon ?? ''}`}
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {chip.icon ? (
                  <Ionicons name={chip.icon} size={14} color={chip.iconColor ?? colors.textMuted} />
                ) : null}
                <Text style={[typography.caption, { color: colors.text }]}>{chip.label}</Text>
              </View>
            ))}
        </View>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          {showLogDetails ? (
            <Pressable
              onPress={onLogDetails}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
              <Text style={[typography.captionMedium, { color: colors.primaryText }]}>
                Log details
              </Text>
            </Pressable>
          ) : null}
          {showLogPeriod ? (
            <Pressable
              onPress={onLogPeriod}
              accessibilityRole="button"
              style={({ pressed }) => [
                showLogDetails ? styles.outlineBtn : styles.primaryBtn,
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  typography.captionMedium,
                  { color: showLogDetails ? colors.primary : colors.primaryText },
                ]}>
                Log period
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.roseTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
