export type PartnerLearnCard = {
  id: string;
  title: string;
  body: string;
  category: 'phase' | 'support' | 'pcos' | 'communication';
};

export const PARTNER_LEARN_CARDS: readonly PartnerLearnCard[] = [
  {
    id: 'period-basics',
    title: 'During her period',
    body: 'Cramps, fatigue, and mood shifts are normal. Offer comfort — heat, rest, favourite foods — without making it a project to fix.',
    category: 'phase',
  },
  {
    id: 'pms',
    title: 'Before her period (PMS)',
    body: 'Irritability, bloating, or sensitivity can show up. Avoid "Are you on your period?" jokes. Ask how you can help.',
    category: 'phase',
  },
  {
    id: 'follicular',
    title: 'After her period',
    body: 'Energy often rises in the follicular phase. Great time for plans together — still ask, never assume.',
    category: 'phase',
  },
  {
    id: 'empathy-scripts',
    title: 'What to say',
    body: '"How are you feeling today?" beats "You seem off." "Want company or space?" gives her control.',
    category: 'communication',
  },
  {
    id: 'pcos-intro',
    title: 'PCOS in plain language',
    body: 'PCOS affects hormones, cycles, skin, and metabolism. It is manageable but not her fault. Support clinic visits without pressure.',
    category: 'pcos',
  },
  {
    id: 'no-surveillance',
    title: 'Support, not monitoring',
    body: 'This app shares what she chooses. Use it to learn and empathise — not to score points or track her.',
    category: 'communication',
  },
  {
    id: 'date-night',
    title: 'Planning dates',
    body: 'Low-key options during period weeks: movies, home cooking, walks. Save high-energy adventures for when she feels up to it.',
    category: 'support',
  },
  {
    id: 'travel',
    title: 'Trips together',
    body: 'Pack period supplies even if estimates look clear. Cycles shift — especially with PCOS or stress.',
    category: 'support',
  },
];
