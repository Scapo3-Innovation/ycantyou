import {
  MAX_SYMPTOM_INSIGHTS,
  MIN_DOMINANT_SHARE,
  MIN_SYMPTOM_OCCURRENCES,
} from './constants';
import type { SymptomInsight, SymptomPhasePattern } from './types';

/**
 * Turn the per-(symptom, phase) counts from the RPC into a short list of well-supported
 * insights. A symptom is surfaced only when it's logged enough times AND clearly leans
 * toward one phase — otherwise we stay quiet rather than imply a pattern that isn't there.
 */
export function selectSymptomInsights(rows: SymptomPhasePattern[]): SymptomInsight[] {
  // Group rows by symptom.
  const bySymptom = new Map<string, SymptomPhasePattern[]>();
  for (const row of rows) {
    const list = bySymptom.get(row.symptom_code) ?? [];
    list.push(row);
    bySymptom.set(row.symptom_code, list);
  }

  const insights: SymptomInsight[] = [];
  for (const [symptom_code, group] of bySymptom) {
    const total = group.reduce((sum, r) => sum + r.occurrences, 0);
    if (total < MIN_SYMPTOM_OCCURRENCES) continue;

    const dominant = group.reduce((best, r) => (r.occurrences > best.occurrences ? r : best));
    if (dominant.occurrences / total < MIN_DOMINANT_SHARE) continue;

    insights.push({
      symptom_code,
      label: dominant.label,
      phase: dominant.phase,
      occurrences: dominant.occurrences,
      total,
    });
  }

  // Strongest leans first (by share, then by volume).
  insights.sort((a, b) => b.occurrences / b.total - a.occurrences / a.total || b.total - a.total);
  return insights.slice(0, MAX_SYMPTOM_INSIGHTS);
}
