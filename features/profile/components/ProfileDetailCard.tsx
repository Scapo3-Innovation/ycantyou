import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ProfileDetailCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
};

/** White profile detail row — icon, label, value/editor, optional trailing icon. */
export function ProfileDetailCard({ icon, label, children, trailing }: ProfileDetailCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
        {children}
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={colors.secondary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
