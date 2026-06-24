import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ResultDisclaimer } from '@/features/screener/components/ResultDisclaimer';
import { colors, spacing, typography } from '@/theme';

export default function ScreenerIntroScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[typography.title, { color: c.text }]}>PCOS risk screener</Text>
          <Text style={[typography.body, { color: c.textMuted }]}>
            A short checklist about signs commonly associated with PCOS. It takes a couple of
            minutes and helps you decide whether to see a clinician — it cannot diagnose anything.
          </Text>
        </View>

        <ResultDisclaimer />

        <Text style={[typography.body, { color: c.textMuted }]}>
          Your answers are private to you. We use them only to show your screening indication and to
          build a report you can take to a doctor.
        </Text>

        <View style={styles.actions}>
          <Button label="Start screener" onPress={() => router.push('/(screener)/questions')} />
          <Button
            label="View past results"
            variant="secondary"
            onPress={() => router.push('/(screener)/history')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
