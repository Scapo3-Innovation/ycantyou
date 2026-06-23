/**
 * Design tokens — color palette.
 *
 * A calm, trustworthy palette for a women's health app: a warm berry/plum brand
 * (not the clichéd hot pink), neutral surfaces, and clear semantic states.
 * Light and dark variants share the same token keys so components can index by scheme.
 */

export const colors = {
  light: {
    text: '#1A1320',
    textMuted: '#6B6473',
    background: '#FBF8FC',
    surface: '#FFFFFF',
    border: '#E8E2EE',
    primary: '#A14E8C',
    primaryText: '#FFFFFF',
    success: '#2E7D5B',
    warning: '#B26A00',
    danger: '#C13B3B',
    tabInactive: '#9A93A3',
  },
  dark: {
    text: '#F4EFF7',
    textMuted: '#A79FB0',
    background: '#141019',
    surface: '#1E1825',
    border: '#2C2435',
    primary: '#D49ABF',
    primaryText: '#1A1320',
    success: '#6BC79A',
    warning: '#E0A24A',
    danger: '#E07A7A',
    tabInactive: '#7C7488',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
