/**
 * Design tokens — color palette.
 *
 * A clean, white, minimal system: white/near-white surfaces, one warm primary accent
 * used sparingly, and a calm secondary for positive/insight accents. Single (light)
 * theme — components reference these tokens directly (no light/dark branching).
 */

export const colors = {
  background: '#FFFFFF', // app background
  surfaceAlt: '#F7F8FA', // subtle recessed areas / chips
  surface: '#FFFFFF', // cards
  border: '#ECEEF1', // subtle card + hairline border

  text: '#1C1C1E', // primary text / key numbers
  textMuted: '#6E7178', // secondary text
  textFaint: '#9AA0A6', // tertiary / disabled / tab inactive

  primary: '#E76A8A', // THE accent — primary actions, active state, key numbers
  primaryText: '#FFFFFF',
  secondary: '#3BA99C', // positive / insight accent
  secondaryText: '#FFFFFF',

  success: '#3BA99C',
  warning: '#C8862A',
  danger: '#E5484D',

  tabInactive: '#9AA0A6',
} as const;

export type ColorToken = keyof typeof colors;
