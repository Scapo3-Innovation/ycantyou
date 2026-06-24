import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';

const PROMISES = [
  { icon: 'leaf-outline' as const, text: 'Collect only what a feature needs.' },
  { icon: 'lock-closed-outline' as const, text: 'Keep your data encrypted and never sell it.' },
  { icon: 'download-outline' as const, text: 'Let you export or delete everything, anytime.' },
];

/** Visual promise bullets for the consent screen. */
export function PromiseList() {
  return (
    <Card>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>We promise to</Text>
      <View style={styles.list}>
        {PROMISES.map((item) => (
          <View key={item.text} style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text style={[typography.body, styles.text, { color: colors.textMuted }]}>{item.text}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    paddingTop: 6,
  },
});
