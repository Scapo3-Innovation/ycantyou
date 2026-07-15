/**
 * Design tokens — ycantyou brand palette.
 *
 * Warm, trustworthy, calm. Single light theme — components reference these tokens
 * directly (no light/dark branching).
 */

export const colors = {
  background: '#FAFAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F8FA',

  border: '#ECEEF1',

  text: '#1C1C1E',
  textMuted: '#6E7178',
  textFaint: '#9AA0A6',

  /** Primary accent — CTAs, active states, key highlights. */
  primary: '#E76A8A',
  primaryText: '#FFFFFF',

  /** Secondary accent — positive states, insights, progress. */
  secondary: '#3BA99C',
  secondaryText: '#FFFFFF',

  /** Supporting tints for cards and soft backgrounds. */
  roseTint: '#FCECF1',
  tealTint: '#E7F5F2',

  success: '#3BA99C',
  warning: '#C8862A',
  danger: '#E5484D',

  tabInactive: '#9AA0A6',

  /** Frosted-glass surfaces — floating nav, overlays. */
  glass: {
    pillFill: 'rgba(250, 250, 251, 0.55)',
    pillTint: 'rgba(252, 236, 241, 0.35)',
    pillHighlight: 'rgba(255, 255, 255, 0.72)',
    pillBorder: 'rgba(28, 28, 30, 0.14)',
    pillRing: 'rgba(231, 106, 138, 0.22)',
    pillRingTeal: 'rgba(59, 169, 156, 0.22)',
    pillGlowRose: 'rgba(231, 106, 138, 0.2)',
    pillGlowTeal: 'rgba(59, 169, 156, 0.2)',
    pillEdge: 'rgba(236, 238, 241, 0.55)',
    sheen: 'rgba(255, 255, 255, 0.55)',
    activeRose: 'rgba(252, 236, 241, 0.55)',
    activeRoseMid: 'rgba(252, 236, 241, 0.28)',
    activeRoseEdge: 'rgba(252, 236, 241, 0)',
    activeTeal: 'rgba(231, 245, 242, 0.55)',
    activeTealMid: 'rgba(231, 245, 242, 0.28)',
    activeTealEdge: 'rgba(231, 245, 242, 0)',
    inactiveCircle: 'rgba(255, 255, 255, 0.78)',
    inactiveCircleTeal: 'rgba(255, 255, 255, 0.78)',
  },
} as const;

export type ColorToken = keyof typeof colors;
