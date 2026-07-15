import { useSegments } from 'expo-router';

import {
  FloatingPillTabBar,
  type FloatingPillTabBarProps,
} from '@/components/ui/FloatingPillTabBar';

const MAIN_TAB_ROUTES = ['index', 'partner', 'track', 'community', 'analytics'] as const;

const HIDDEN_TAB_BAR_SCREENS = new Set(['profile', 'learn']);

function shouldHideTabBar(segments: string[]): boolean {
  if (segments[0] !== '(tabs)') return false;
  const screen = segments[1];
  return screen !== undefined && HIDDEN_TAB_BAR_SCREENS.has(screen);
}

/** Main tabs bar — hidden on profile and learn so it does not overlap stack screens. */
export function MainTabsTabBar(props: FloatingPillTabBarProps) {
  const segments = useSegments();

  if (shouldHideTabBar(segments)) return null;

  return <FloatingPillTabBar {...props} visibleRoutes={MAIN_TAB_ROUTES} />;
}
