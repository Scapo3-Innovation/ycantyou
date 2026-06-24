import type { TextStyle } from 'react-native';

/** Loaded via @expo-google-fonts/poppins in app/_layout.tsx */
export const fontFamily = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export type FontWeightToken = keyof typeof fontFamily;

/** Map RN fontWeight values to the matching Poppins face. */
export function fontFromWeight(weight: TextStyle['fontWeight'] = '400'): string {
  switch (weight) {
    case '700':
    case 'bold':
      return fontFamily.bold;
    case '600':
      return fontFamily.semibold;
    case '500':
      return fontFamily.medium;
    case '300':
    case 'light':
      return fontFamily.light;
    default:
      return fontFamily.regular;
  }
}

/** react-native-calendars theme keys for Poppins. */
export const calendarFontTheme = {
  textDayFontFamily: fontFamily.regular,
  textMonthFontFamily: fontFamily.semibold,
  textDayHeaderFontFamily: fontFamily.medium,
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 13,
} as const;
