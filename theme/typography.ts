import type { TextStyle } from 'react-native';

/**
 * Design tokens — typography.
 * A compact, readable scale. Colors are applied at the call site.
 *
 * `title` and `heading` are kept as aliases of `display` / `h2` so existing call sites
 * stay valid while new components use the explicit names.
 */

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const typography = {
  display: { fontSize: 32, fontWeight: fontWeight.bold, lineHeight: 38 },
  h1: { fontSize: 24, fontWeight: fontWeight.bold, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: fontWeight.semibold, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: fontWeight.regular, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: fontWeight.semibold, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: fontWeight.regular, lineHeight: 18 },
  button: { fontSize: 16, fontWeight: fontWeight.semibold, lineHeight: 20 },

  // Backwards-compatible aliases.
  title: { fontSize: 32, fontWeight: fontWeight.bold, lineHeight: 38 },
  heading: { fontSize: 20, fontWeight: fontWeight.semibold, lineHeight: 26 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
