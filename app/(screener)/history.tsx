import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { HistoryList } from '@/features/screener/components/HistoryList';
import { useScreenerHistory } from '@/features/screener/queries';
import { colors, spacing, typography } from '@/theme';

export default function ScreenerHistoryScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = colors[scheme];

  const { data: results = [], isLoading } = useScreenerHistory();

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[typography.title, { color: c.text }]}>Past results</Text>

        <HistoryList
          results={results}
          onSelect={(sessionId) =>
            router.push({ pathname: '/(screener)/result', params: { sessionId } })
          }
        />

        <View style={styles.actions}>
          <Button label="Take the screener" onPress={() => router.replace('/(screener)/questions')} />
          <Button label="Back to home" variant="secondary" onPress={() => router.replace('/(tabs)')} />
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
