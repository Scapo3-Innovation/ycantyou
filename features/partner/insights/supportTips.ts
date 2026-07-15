import type { PartnerCycleState, PartnerDashboard, PartnerDashboardPrediction } from '@/types/database';

export type PartnerSupportTip = {
  id: string;
  title: string;
  body: string;
  tone: 'support' | 'heads_up' | 'wellness' | 'education';
};

const PHASE_TIPS: Record<string, { title: string; body: string }> = {
  menstrual: {
    title: 'Period support',
    body: 'Cramps and fatigue are common. Offer a heat pad, hydration, and low-key plans. Ask what she needs rather than assuming.',
  },
  follicular: {
    title: 'Rising energy',
    body: 'Energy often picks up in this phase. Active dates can work well if she feels up to it — always follow her lead.',
  },
  ovulation: {
    title: 'Mid-cycle',
    body: 'Some people feel more social or energetic now. Check in about plans rather than scheduling around estimates.',
  },
  luteal: {
    title: 'Pre-period phase',
    body: 'Mood shifts, bloating, or PMS can show up. Extra patience, comfort food without judgment, and flexible plans help.',
  },
};

function periodTip(day: number): PartnerSupportTip {
  const menstrual = PHASE_TIPS.menstrual;
  if (day <= 2) {
    return {
      id: 'period-early',
      title: 'Early period days',
      body: 'Flow is often heaviest now. Keep plans gentle and have pain relief available if she uses it.',
      tone: 'support',
    };
  }
  return {
    id: 'period-mid',
    title: `Period day ${day}`,
    body: menstrual?.body ?? 'Offer comfort and keep plans flexible.',
    tone: 'support',
  };
}

function predictionHeadsUp(prediction: PartnerDashboardPrediction): PartnerSupportTip | null {
  if (prediction.status === 'insufficient' || prediction.status === 'irregular') return null;
  if (!prediction.next_period) return null;
  return {
    id: 'period-coming',
    title: 'Period may be approaching',
    body: `Her next period is estimated around ${prediction.next_period.predicted_start}. Keep plans flexible — estimates vary.`,
    tone: 'heads_up',
  };
}

/** Build supportive, non-surveillance tips from the filtered partner dashboard snapshot. */
export function buildPartnerSupportTips(dashboard: PartnerDashboard): PartnerSupportTip[] {
  if (dashboard.status !== 'active') return [];

  const tips: PartnerSupportTip[] = [];

  if (dashboard.cycle_state) {
    const state = dashboard.cycle_state;
    if (state.kind === 'period') {
      tips.push(periodTip(state.day));
    } else if (state.phase) {
      const phaseTip = PHASE_TIPS[state.phase];
      if (phaseTip) {
        tips.push({
          id: `phase-${state.phase}`,
          title: phaseTip.title,
          body: phaseTip.body,
          tone: 'support',
        });
      }
    }
  }

  if (dashboard.prediction) {
    const headsUp = predictionHeadsUp(dashboard.prediction);
    if (headsUp) tips.push(headsUp);
  }

  if (dashboard.wellness_today) {
    const { mood, energy } = dashboard.wellness_today;
    if (energy === 'Drained' || energy === 'Low' || mood === 'Stressed' || mood === 'Not great') {
      tips.push({
        id: 'wellness-checkin',
        title: 'Gentle check-in',
        body: 'She logged lower energy or mood today. A simple "How are you feeling?" goes further than fixing.',
        tone: 'wellness',
      });
    }
  }

  if (dashboard.screener_band && dashboard.screener_band !== 'low') {
    tips.push({
      id: 'pcos-awareness',
      title: 'PCOS awareness',
      body: 'Her screener suggested elevated PCOS risk — not a diagnosis. Support clinic visits and lifestyle changes without pressure.',
      tone: 'education',
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: 'default',
      title: 'Be present',
      body: 'The best support is asking what she needs today. Cycle data is a guide, not a script.',
      tone: 'support',
    });
  }

  return tips;
}

export function formatCycleStateLabel(state: PartnerCycleState | null): string | null {
  if (!state) return null;
  if (state.kind === 'period') return `Period · Day ${state.day}`;
  const phaseLabel =
    state.phase === 'menstrual'
      ? 'Menstrual'
      : state.phase === 'follicular'
        ? 'Follicular'
        : state.phase === 'ovulation'
          ? 'Ovulation'
          : state.phase === 'luteal'
            ? 'Luteal'
            : 'Cycle';
  return `${phaseLabel} · Day ${state.day}`;
}
