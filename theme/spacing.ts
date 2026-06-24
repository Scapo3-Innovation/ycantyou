/**
 * Design tokens — spacing scale (4-based) and corner radii.
 * Use these instead of hardcoded numbers so layout stays consistent.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  control: 14, // buttons / inputs
  lg: 16, // cards
  full: 9999, // pills / chips
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
