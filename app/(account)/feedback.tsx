import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { useAppDialog } from '@/components/ui/AppDialogProvider';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { submitUserFeedback } from '@/features/feedback/api';
import { FeedbackCategoryPicker } from '@/features/feedback/components/FeedbackCategoryPicker';
import { FeedbackMessageField } from '@/features/feedback/components/FeedbackMessageField';
import {
  FEEDBACK_PLACEHOLDERS,
  FEEDBACK_PRIVACY_NOTE,
  FEEDBACK_SCREEN,
  FEEDBACK_SUCCESS,
} from '@/features/feedback/constants';
import { feedbackMessageSchema } from '@/features/feedback/validation';
import { analytics } from '@/lib/analytics';
import { colors, fullScreenScrollContent, radius, spacing, typography } from '@/theme';
import type { FeedbackKind } from '@/types/database';

function parseInitialKind(value: string | undefined): FeedbackKind {
  if (value === 'bug' || value === 'feature' || value === 'feedback') return value;
  return 'feedback';
}

export default function FeedbackScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { alert } = useAppDialog();
  const userId = session?.user.id;
  const { kind: kindParam } = useLocalSearchParams<{ kind?: string }>();

  const [kind, setKind] = useState<FeedbackKind>(() => parseInitialKind(kindParam));
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState<string>();

  const mutation = useMutation({
    mutationFn: (body: string) => {
      if (!userId) throw new Error('Not signed in');
      return submitUserFeedback({ userId, kind, message: body });
    },
    onSuccess: () => {
      analytics.track('user_feedback_submitted', { kind });
      alert('Thank you', FEEDBACK_SUCCESS[kind], [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (err: unknown) => {
      const text =
        err instanceof Error ? err.message : 'Could not send right now. Please try again.';
      alert('Could not send', text);
    },
  });

  function onSubmit() {
    setFieldError(undefined);
    const parsed = feedbackMessageSchema.safeParse({ message });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    mutation.mutate(parsed.data.message);
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[typography.h1, { color: colors.text }]}>{FEEDBACK_SCREEN.title}</Text>
            <Text style={[typography.body, styles.subtitle, { color: colors.textMuted }]}>
              {FEEDBACK_SCREEN.subtitle}
            </Text>
          </View>

          <FeedbackCategoryPicker value={kind} onChange={setKind} />

          <FeedbackMessageField
            value={message}
            onChangeText={setMessage}
            placeholder={FEEDBACK_PLACEHOLDERS[kind]}
            error={fieldError}
          />

          <Text style={[typography.caption, styles.privacy, { color: colors.textFaint }]}>
            {FEEDBACK_PRIVACY_NOTE}
          </Text>

          <View style={styles.actions}>
            <Button
              label={FEEDBACK_SCREEN.submitLabel}
              onPress={onSubmit}
              loading={mutation.isPending}
              disabled={!userId}
            />
            <Button
              label={FEEDBACK_SCREEN.dismissLabel}
              variant="ghost"
              onPress={() => router.back()}
              disabled={mutation.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    ...fullScreenScrollContent,
    gap: spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -spacing.sm,
  },
  header: {
    gap: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  privacy: {
    lineHeight: 18,
    marginTop: -spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
