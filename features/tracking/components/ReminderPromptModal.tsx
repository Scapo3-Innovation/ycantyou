import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { REMINDER_PROMPT_COPY } from '@/features/tracking/reminderPromptCopy';
import { colors, radius, spacing, typography } from '@/theme';

type ReminderPromptModalProps = {
  visible: boolean;
  loading?: boolean;
  onEnable: () => void;
  onLater: () => void;
};

/** One-time post-login explainer — encourages turning reminders on with clear benefits. */
export function ReminderPromptModal({
  visible,
  loading = false,
  onEnable,
  onLater,
}: ReminderPromptModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={[typography.h2, styles.title, { color: colors.text }]}>
            {REMINDER_PROMPT_COPY.title}
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, lineHeight: 22 }]}>
            {REMINDER_PROMPT_COPY.intro}
          </Text>

          <View style={styles.list}>
            {REMINDER_PROMPT_COPY.bullets.map((line) => (
              <View key={line} style={styles.bulletRow}>
                <Text style={[typography.bodyMedium, { color: colors.primary }]}>•</Text>
                <Text style={[typography.caption, styles.bulletText, { color: colors.text }]}>
                  {line}
                </Text>
              </View>
            ))}
          </View>

          <Button
            label={REMINDER_PROMPT_COPY.primaryCta}
            onPress={onEnable}
            loading={loading}
            disabled={loading}
          />

          <Pressable
            onPress={onLater}
            disabled={loading}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.later, pressed && styles.pressed]}>
            <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
              {REMINDER_PROMPT_COPY.secondaryCta}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  later: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
});
