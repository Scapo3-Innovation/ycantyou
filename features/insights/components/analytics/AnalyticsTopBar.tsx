import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar';
import { colors, spacing, typography } from '@/theme';

type AnalyticsTopBarProps = {
  userName?: string | null;
  avatarUrl?: string | null;
};

/** Compact stats header — title left, profile avatar right. */
export function AnalyticsTopBar({ userName, avatarUrl }: AnalyticsTopBarProps) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[typography.bodyMedium, styles.title, { color: colors.text }]}>Stats</Text>
        <Text style={[typography.caption, { color: colors.textFaint }]}>
          From your logs — not a diagnosis
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        hitSlop={8}
        style={({ pressed }) => [styles.avatarBtn, pressed && styles.pressed]}>
        <ProfileAvatar avatarUrl={avatarUrl} size={36} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  avatarBtn: {
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.88,
  },
});
