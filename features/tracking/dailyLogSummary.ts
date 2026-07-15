import {
  ENERGY_OPTIONS,
  FLOW_LEVELS,
  MOOD_OPTIONS,
  type FlowOption,
  type WellnessOption,
} from '@/features/tracking/constants';
import type { DailyLog, DailyLogWithSymptoms } from '@/types/database';
import { colors } from '@/theme';

export type DailyLogSummaryChip = {
  icon?: WellnessOption['icon'] | FlowOption['icon'];
  iconColor?: string;
  label: string;
};

/** Short labels for chips on the track today card and similar surfaces. */
export function dailyLogSummaryChips(
  log: DailyLog | DailyLogWithSymptoms,
): DailyLogSummaryChip[] {
  const chips: DailyLogSummaryChip[] = [];

  if (log.mood != null) {
    const mood = MOOD_OPTIONS.find((option) => option.value === log.mood);
    if (mood) {
      chips.push({ icon: mood.icon, iconColor: mood.iconColor, label: mood.label });
    }
  }

  if (log.energy != null) {
    const energy = ENERGY_OPTIONS.find((option) => option.value === log.energy);
    if (energy) {
      chips.push({ icon: energy.icon, iconColor: energy.iconColor, label: energy.label });
    }
  }

  if (log.flow_level && log.flow_level !== 'none') {
    const flow = FLOW_LEVELS.find((option) => option.value === log.flow_level);
    if (flow) {
      chips.push({
        icon: flow.icon,
        iconColor: flow.iconColor,
        label: `${flow.label} flow`,
      });
    }
  }

  const symptomCount =
    'symptom_codes' in log && Array.isArray(log.symptom_codes) ? log.symptom_codes.length : 0;
  if (symptomCount > 0) {
    chips.push({
      icon: 'medkit-outline',
      iconColor: colors.secondary,
      label: `${symptomCount} symptom${symptomCount === 1 ? '' : 's'}`,
    });
  }

  if (log.notes?.trim()) {
    chips.push({
      icon: 'document-text-outline',
      iconColor: colors.textMuted,
      label: 'Notes',
    });
  }

  return chips;
}

export function hasDailyLogEntry(log: DailyLog | DailyLogWithSymptoms | null | undefined): boolean {
  if (!log) return false;
  return dailyLogSummaryChips(log).length > 0;
}
