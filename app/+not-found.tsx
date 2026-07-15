import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, spacing, typography } from '@/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  const c = colors;

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen style={styles.screen}>
        <Card style={styles.card}>
          <ScreenHeader title="Page not found" subtitle="This screen does not exist." />
          <Text style={[typography.body, styles.message, { color: c.textMuted }]}>
            The link may be broken or the page may have moved.
          </Text>
          <Button label="Go to home" onPress={() => router.replace('/(tabs)')} />
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  card: {
    gap: spacing.lg,
  },
  message: {
    textAlign: 'center',
  },
});
