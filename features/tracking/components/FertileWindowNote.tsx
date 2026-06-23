import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

/**
 * Permanent disclaimer that must accompany ANY fertile-window UI.
 * The fertile window is an estimate and explicitly NOT a contraceptive method.
 */
export function FertileWindowNote() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return (
    <View style={[styles.note, { backgroundColor: c.surface, borderColor: c.warning }]}>
      <Text style={[typography.caption, { color: c.text }]}>
        The fertile window is an estimate based on average cycle length. It is{' '}
        <Text style={styles.bold}>not a method of contraception</Text> and should not be used to
        prevent pregnancy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  bold: {
    fontWeight: '700',
  },
});
