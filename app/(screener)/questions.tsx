import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProgressBar } from '@/features/screener/components/ProgressBar';
import { QuestionCard } from '@/features/screener/components/QuestionCard';
import { useSubmitScreener } from '@/features/screener/mutations';
import { useActiveQuestions } from '@/features/screener/queries';
import type { AnswersByCode } from '@/features/screener/types';
import { colors, spacing, typography } from '@/theme';

const ADVANCE_DELAY_MS = 240;

export default function ScreenerQuestionsScreen() {
  const router = useRouter();

  const [sessionId] = useState(() => Crypto.randomUUID());
  const { data: questions, isLoading } = useActiveQuestions();
  const submit = useSubmitScreener();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersByCode>({});
  const [error, setError] = useState<string>();
  const [isAdvancing, setIsAdvancing] = useState(false);

  if (isLoading) return <LoadingScreen />;

  if (!questions || questions.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            The screener is unavailable right now. Please try again later.
          </Text>
          <Button label="Go back" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const current = questions[index]!;
  const answer = answers[current.code];
  const isLast = index === questions.length - 1;
  const busy = isAdvancing || submit.isPending;

  function onBack() {
    if (index > 0) {
      setIsAdvancing(false);
      setIndex((i) => i - 1);
      return;
    }
    router.back();
  }

  function submitAnswers(answerSet: AnswersByCode) {
    setError(undefined);
    submit.mutate(
      { sessionId, answers: answerSet },
      {
        onSuccess: () =>
          router.replace({ pathname: '/(screener)/result', params: { sessionId } }),
        onError: (err) =>
          setError(
            err instanceof Error
              ? err.message
              : 'Could not score your answers. Please try again.',
          ),
      },
    );
  }

  function onAnswer(value: boolean) {
    if (busy) return;

    const nextAnswers = { ...answers, [current.code]: value };
    setAnswers(nextAnswers);
    setError(undefined);

    if (isLast) {
      submitAnswers(nextAnswers);
      return;
    }

    setIsAdvancing(true);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setIsAdvancing(false);
    }, ADVANCE_DELAY_MS);
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.flex}>
        <View style={styles.headerBlock}>
          <ScreenHeader title="Screener" onBack={onBack} />
          <ProgressBar current={index + 1} total={questions.length} />
        </View>

        <View style={styles.content}>
          <QuestionCard
            text={current.text}
            value={answer ?? null}
            onAnswer={onAnswer}
            disabled={busy}
          />
        </View>

        {submit.isPending ? (
          <View style={styles.submitting}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Calculating your result…
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBlock}>
            <Text style={[typography.caption, styles.error, { color: colors.danger }]}>
              {error}
            </Text>
            <Button
              label="Try again"
              variant="secondary"
              onPress={() => submitAnswers(answers)}
              disabled={submit.isPending || Object.keys(answers).length < questions.length}
            />
          </View>
        ) : null}
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
    paddingBottom: spacing.xl,
  },
  headerBlock: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  submitting: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  error: {
    textAlign: 'center',
  },
  errorBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
