import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { HistoryList } from '@/features/screener/components/HistoryList';
import { useScreenerHistory } from '@/features/screener/queries';
import { screenScrollContent, spacing } from '@/theme';

export default function ScreenerHistoryScreen() {
  const router = useRouter();

  const { data: results = [], isLoading, isError, refetch } = useScreenerHistory();

  if (isLoading) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="Past results"
          subtitle="Previous screener attempts — not diagnoses."
          onBack={() => router.back()}
        />

        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : (
          <HistoryList
            results={results}
            onSelect={(sessionId) =>
              router.push({ pathname: '/(screener)/result', params: { sessionId } })
            }
          />
        )}

        <View style={styles.actions}>
          <Button label="Take the screener" onPress={() => router.replace('/(screener)/questions')} />
          <Button label="Back to home" variant="secondary" onPress={() => router.replace('/(tabs)')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: screenScrollContent,
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
