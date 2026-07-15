import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';

type SettingsToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
};

/** Premium toggle row in its own card. */
export function SettingsToggleRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  loading = false,
}: SettingsToggleRowProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconTile}>
          <Ionicons name={icon} size={18} color={colors.text} />
        </View>
        <View style={styles.copy}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: colors.border, true: colors.roseTint }}
            thumbColor={value ? colors.primary : colors.surface}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
