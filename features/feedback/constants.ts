import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { FeedbackKind } from '@/types/database';

export type FeedbackCategoryOption = {
  kind: FeedbackKind;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  { kind: 'bug', label: 'Bug', icon: 'bug-outline' },
  { kind: 'feature', label: 'Feature', icon: 'bulb-outline' },
  { kind: 'feedback', label: 'Feedback', icon: 'chatbubble-outline' },
];

export const FEEDBACK_SCREEN = {
  title: 'Send feedback',
  subtitle: "Found a bug or have an idea? We'd love to hear it.",
  submitLabel: 'Send feedback',
  dismissLabel: 'Not now',
  maxLength: 2000,
} as const;

export const FEEDBACK_PLACEHOLDERS: Record<FeedbackKind, string> = {
  bug: 'What broke? Include what you tapped and what you expected to happen.',
  feature: 'Describe the feature you wish the app had and how it would help you.',
  feedback: 'Tell us what you think — the good and the bad.',
};

export const FEEDBACK_SUCCESS: Record<FeedbackKind, string> = {
  bug: 'Your bug report was sent. We will look into it.',
  feature: 'Your feature idea was sent. Thank you for helping us improve.',
  feedback: 'Your feedback was sent. We really appreciate it.',
};

export const FEEDBACK_PRIVACY_NOTE =
  'Please do not include passwords or detailed health information.';
