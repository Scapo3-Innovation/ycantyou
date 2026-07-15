import { StyleSheet } from 'react-native';

import { spacing } from './spacing';

/** Height of the floating pill tab bar (excluding safe-area inset). */
export const FLOATING_TAB_BAR_HEIGHT = 67;

/** Bottom inset for scroll content when the floating pill tab bar is visible. */
export const floatingTabBarScrollInset = FLOATING_TAB_BAR_HEIGHT + spacing.xxl;

/** Scroll padding for full-screen routes that hide the tab bar (profile, learn stack). */
export const fullScreenScrollContent = {
  gap: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xxl,
} as const;

/** Standard ScrollView contentContainerStyle for app screens (Screen already adds horizontal padding). */
export const screenScrollContent = {
  gap: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: floatingTabBarScrollInset,
} as const;

export const screenScrollStyles = StyleSheet.create({
  content: screenScrollContent,
});
