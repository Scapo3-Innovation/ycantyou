import { Ionicons } from '@expo/vector-icons';

/** Default content language. The hub is structured to add more later without rework. */
export const DEFAULT_LANGUAGE = 'en';

/** Icon per category slug (falls back to a book icon for unknown slugs). */
export const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  basics: 'sparkles-outline',
  nutrition: 'nutrition-outline',
  movement: 'walk-outline',
  mental_health: 'heart-outline',
  myths: 'help-circle-outline',
};

export const DEFAULT_CATEGORY_ICON: keyof typeof Ionicons.glyphMap = 'book-outline';
