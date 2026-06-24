import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

/** Small reusable privacy reassurance line. Optionally tappable (e.g. to the policy). */
export function PrivacyNote({ onPress }: { onPress?: () => void }) {
  const content = (
    <View style={styles.row}>
      <Ionicons name="lock-closed-outline" size={14} color={colors.secondary} />
      <Text style={[typography.caption, styles.text, { color: colors.textMuted }]}>
        Your data is private — we never sell it.
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  text: {
    textAlign: 'center',
  },
});
