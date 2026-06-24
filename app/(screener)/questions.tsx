import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ProgressBar } from '@/features/screener/components/ProgressBar';
import { QuestionCard } from '@/features/screener/components/QuestionCard';
import { useSubmitScreener } from '@/features/screener/mutations';
import { useActiveQuestions } from '@/features/screener/queries';
import type { AnswersByCode } from '@/features/screener/types';
import { colors, spacing, typography } from '@/theme';

export default function ScreenerQuestionsScreen() {
  const router = useRouter();
  const c = colors;

  // One session id per attempt, generated client-side and stable across renders.
  const [sessionId] = useState(() => Crypto.randomUUID());
  const { data: questions, isLoading } = useActiveQuestions();
  const submit = useSubmitScreener();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersByCode>({});
  const [error, setError] = useState<string>();

  if (isLoading) return <LoadingScreen />;

  if (!questions || questions.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[typography.body, { color: c.textMuted }]}>
            The screener is unavailable right now. Please try again later.
          </Text>
          <Button label="Go back" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const current = questions[index]!;
  const answer = answers[current.code];
  const isLast = index === questions.length - 1;
  const answered = answer !== undefined;

  function onAnswer(value: boolean) {
    setAnswers((prev) => ({ ...prev, [current.code]: value }));
  }

  function onNext() {
    if (!answered) return;
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    setError(undefined);
    submit.mutate(
      { sessionId, answers },
      {
        onSuccess: () => router.replace({ pathname: '/(screener)/result', params: { sessionId } }),
        onError: () => setError('Could not score your answers. Please check your connection and try again.'),
      },
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ProgressBar current={index + 1} total={questions.length} />

        <QuestionCard text={current.text} value={answer ?? null} onAnswer={onAnswer} />

        {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button
            label={isLast ? 'See result' : 'Next'}
            onPress={onNext}
            disabled={!answered}
            loading={submit.isPending}
          />
          {index > 0 ? (
            <Button
              label="Back"
              variant="secondary"
              onPress={() => setIndex((i) => i - 1)}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
