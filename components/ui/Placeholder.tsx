import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { colors, spacing, typography } from '@/theme';

type PlaceholderProps = {
  title: string;
  subtitle?: string;
};

/**
 * Empty-state placeholder used by the Module 1 tab shell.
 * Replaced by real feature screens in later modules.
 */
export function Placeholder({ title, subtitle = 'Coming soon' }: PlaceholderProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={[typography.title, { color: c.text }]}>{title}</Text>
        <Text style={[typography.body, { color: c.textMuted }]}>{subtitle}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
