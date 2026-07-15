import type { TextStyle } from 'react-native';

import { fontFamily } from '@/theme/fonts';
import { typography } from '@/theme';

/** Readable type scale for the analytics tab. */
export const analyticsTypography = {
  title: { ...typography.h1, fontSize: 26, lineHeight: 32 } satisfies TextStyle,
  section: { ...typography.bodyMedium, fontSize: 15, lineHeight: 20 } satisfies TextStyle,
  body: { ...typography.body, fontSize: 14, lineHeight: 20 } satisfies TextStyle,
  bodyMedium: { ...typography.bodyMedium, fontSize: 14, lineHeight: 20 } satisfies TextStyle,
  stat: { ...typography.bodyMedium, fontSize: 20, lineHeight: 24 } satisfies TextStyle,
  heroNumber: { fontFamily: fontFamily.semibold, fontSize: 32, lineHeight: 36 } satisfies TextStyle,
  delta: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 18 } satisfies TextStyle,
  micro: { ...typography.caption, fontSize: 12, lineHeight: 16 } satisfies TextStyle,
  eyebrow: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  } satisfies TextStyle,
} as const;
