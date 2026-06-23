/**
 * Design tokens — spacing scale (4pt base) and corner radii.
 * Use these instead of hardcoded numbers so layout stays consistent.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
