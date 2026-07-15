import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { PasswordRequirements } from '@/components/ui/PasswordRequirements';
import { Screen, screenBodyPadding } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { updatePassword } from '@/features/auth/api';
import { isPasswordValid } from '@/features/auth/passwordRules';
import { passwordSchema } from '@/features/auth/validation';
import { onboardingImages } from '@/features/onboarding/images';
import { colors, typography } from '@/theme';
import { radius, spacing } from '@/theme/spacing';

const HERO_HEIGHT = 240;
const HERO_HEIGHT_KEYBOARD = 96;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const c = colors;

  const scrollRef = useRef<ScrollView>(null);
  const formScrollY = useRef(0);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const passwordReady = isPasswordValid(password);
  const heroHeight = keyboardOpen ? HERO_HEIGHT_KEYBOARD : HERO_HEIGHT;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function onFormLayout(event: LayoutChangeEvent) {
    formScrollY.current = Math.max(
      0,
      heroHeight + insets.top + spacing.lg + event.nativeEvent.layout.y - spacing.xl,
    );
  }

  function scrollToForm() {
    scrollRef.current?.scrollTo({ y: formScrollY.current, animated: true });
  }

  async function onSubmit() {
    setSubmitError(undefined);
    setPasswordError(undefined);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setPasswordError(parsed.error.issues[0]?.message);
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(parsed.data);
    } catch {
      setSubmitError('Could not update your password. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <Screen edgeToEdge>
      <Pressable
        onPress={() => router.replace('/(auth)/sign-in')}
        accessibilityRole="button"
        accessibilityLabel="Go to sign in"
        hitSlop={12}
        style={[styles.backLink, { top: insets.top + spacing.sm, left: spacing.lg }]}>
        <Text style={[typography.captionMedium, { color: c.primaryText }]}>Back</Text>
      </Pressable>

      <KeyboardAvoidingView
        behavior="padding"
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <HeroBanner
            image={onboardingImages.screening}
            compact
            photoHeight={heroHeight}
            topInset={insets.top}
          />

          <View style={[styles.content, screenBodyPadding]}>
            <View style={styles.header}>
              <Text style={[typography.h1, { color: c.text }]}>New password</Text>
              <Text style={[typography.body, styles.subtitle, { color: c.textMuted }]}>
                Choose a new password for your account.
              </Text>
            </View>

            <View style={styles.form} onLayout={onFormLayout}>
              <TextField
                label="New password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(undefined);
                }}
                error={passwordError}
                autoCapitalize="none"
                autoComplete="new-password"
                secureTextEntry
                textContentType="newPassword"
                placeholder="Letters and numbers"
                returnKeyType="send"
                onFocus={scrollToForm}
                onSubmitEditing={onSubmit}
              />
              <PasswordRequirements password={password} />

              {submitError ? (
                <Text style={[typography.caption, { color: c.danger }]}>{submitError}</Text>
              ) : null}

              <Button
                label="Update password"
                onPress={onSubmit}
                loading={submitting}
                disabled={!passwordReady}
              />
            </View>
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
    flexGrow: 1,
  },
  backLink: {
    position: 'absolute',
    zIndex: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
});
