import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { evaluatePasswordRules } from '@/features/auth/passwordRules';
import { colors, spacing, typography } from '@/theme';

type PasswordRequirementsProps = {
  password: string;
};

/** Live checklist shown while the user types a new password. */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) return null;

  const rules = evaluatePasswordRules(password);
  const allMet = rules.every((rule) => rule.met);

  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={
        allMet
          ? 'Password meets all requirements'
          : 'Password requirements: ' +
            rules
              .filter((rule) => !rule.met)
              .map((rule) => rule.label)
              .join(', ')
      }>
      <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
        Password must include:
      </Text>
      {rules.map((rule) => (
        <View key={rule.id} style={styles.row}>
          <Ionicons
            name={rule.met ? 'checkmark-circle' : 'close-circle-outline'}
            size={16}
            color={rule.met ? colors.success : colors.danger}
          />
          <Text
            style={[
              typography.caption,
              { color: rule.met ? colors.success : colors.textMuted },
            ]}>
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
