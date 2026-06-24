import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { CONTENT_RULES } from '../constants';

/** Community guidelines banner shown atop the feed. */
export function ContentRules() {
  return (
    <View style={[styles.banner, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <Ionicons name="heart-outline" size={18} color={colors.secondary} />
      <Text style={[typography.caption, styles.text, { color: colors.textMuted }]}>
        {CONTENT_RULES}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  text: {
    flex: 1,
  },
});
