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
} as const;

export type ColorToken = keyof typeof colors;
