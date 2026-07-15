import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ScreenerIntroView } from '@/features/screener/components/ScreenerIntroView';
import { colors, spacing } from '@/theme';

export default function ScreenerIntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Screen style={styles.screen}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ScreenHeader
            title="PCOS screener"
            subtitle="Screening only — not a diagnosis"
            onBack={() => router.back()}
          />
          <ScreenerIntroView />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Button label="Start screener" onPress={() => router.push('/(screener)/questions')} />
          <Button
            label="View past results"
            variant="ghost"
            onPress={() => router.push('/(screener)/history')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingHorizontal: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
