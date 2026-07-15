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
  display: { fontFamily: fontFamily.semibold, fontSize: 28, lineHeight: 34 },
  h1: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 26 },
  h2: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  captionMedium: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  captionLight: { fontFamily: fontFamily.light, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 18 },

  /** Uppercase grouped-section label (Settings, Profile, Analytics, Home). */
  sectionEyebrow: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  // Backwards-compatible aliases.
  title: { fontFamily: fontFamily.semibold, fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
