import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';

type PeriodLogPromptModalProps = {
  visible: boolean;
  userName?: string | null;
  onLogPeriod: () => void;
  onLater: () => void;
};

/** Post-login nudge to log at least one period so the app can personalize. */
export function PeriodLogPromptModal({
  visible,
  userName,
  onLogPeriod,
  onLater,
}: PeriodLogPromptModalProps) {
  const name = userName?.trim().split(/\s+/)[0];
  const greeting = name ? `Hi ${name}, ` : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <Pressable style={styles.backdrop} onPress={onLater} accessibilityRole="button">
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Ionicons name="calendar-outline" size={26} color={colors.primary} />
          </View>

          <Text style={[typography.h2, styles.title, { color: colors.text }]}>
            Log your last period
          </Text>

          <Text style={[typography.body, styles.body, { color: colors.textMuted }]}>
            {greeting}add at least one period log so we can customize your cycle calendar,
            predictions, and insights for you.
          </Text>

          <View style={styles.points}>
            <Point text="Personalized cycle day and phase on Home" />
            <Point text="Smarter period estimates from your own history" />
            <Point text="Analytics tailored to your pattern" />
          </View>

          <Button label="Log my period" onPress={onLogPeriod} leftIcon="add-circle-outline" />
          <Button label="Later" variant="secondary" onPress={onLater} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Point({ text }: { text: string }) {
  return (
    <View style={styles.point}>
      <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
      <Text style={[typography.caption, styles.pointText, { color: colors.textMuted }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.45)',
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
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
  },
  points: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pointText: {
    flex: 1,
    lineHeight: 18,
  },
});
