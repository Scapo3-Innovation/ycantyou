import type { TextStyle } from 'react-native';

import { fontFamily } from '@/theme/fonts';
import { typography } from '@/theme';

/** Readable type scale for the analytics tab — aligned with global tokens. */
export const analyticsTypography = {
  title: typography.h1 satisfies TextStyle,
  section: typography.bodyMedium satisfies TextStyle,
  body: typography.body satisfies TextStyle,
  bodyMedium: typography.bodyMedium satisfies TextStyle,
  stat: { ...typography.bodyMedium, fontSize: 17, lineHeight: 22 } satisfies TextStyle,
  heroNumber: { fontFamily: fontFamily.semibold, fontSize: 26, lineHeight: 30 } satisfies TextStyle,
  delta: { ...typography.bodyMedium, fontFamily: fontFamily.semibold } satisfies TextStyle,
  micro: typography.caption satisfies TextStyle,
  eyebrow: typography.sectionEyebrow satisfies TextStyle,
} as const;
