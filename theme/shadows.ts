import type { ViewStyle } from 'react-native';

/**
 * Design tokens — soft elevation. Expo Go-safe (RN iOS shadow props + Android elevation).
 * Keep shadows subtle; this is a light, minimal system.
 */

export const shadows = {
  card: {
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tabBar: {
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.24,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 16 },
    elevation: 18,
  },
  tabBarGlow: {
    shadowColor: '#E76A8A',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tabActive: {
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  glass: {
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const satisfies Record<string, ViewStyle>;
