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
} as const satisfies Record<string, ViewStyle>;
