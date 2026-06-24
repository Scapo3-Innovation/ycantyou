import type { TextStyle } from 'react-native';

import { fontFamily } from './fonts';

/**
 * Design tokens — typography (Poppins).
 * Colors are applied at the call site. Use fontFamily per weight — do not mix fontWeight on Android.
 */

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const typography = {
  display: { fontFamily: fontFamily.semibold, fontSize: 32, lineHeight: 38 },
  h1: { fontFamily: fontFamily.semibold, fontSize: 24, lineHeight: 30 },
  h2: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  captionMedium: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 },
  captionLight: { fontFamily: fontFamily.light, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 20 },

  // Backwards-compatible aliases.
  title: { fontFamily: fontFamily.semibold, fontSize: 32, lineHeight: 38 },
  heading: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 26 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
