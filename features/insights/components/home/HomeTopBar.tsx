import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

import { firstName, timeGreeting } from './homeCopy';

type HomeTopBarProps = {
  selectedDate: string;
  userName?: string | null;
};

/** Profile · greeting · calendar shortcut. */
export function HomeTopBar({ selectedDate, userName }: HomeTopBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dateTitle = format(parseISO(selectedDate), 'd MMMM');
  const name = firstName(userName);
  const greeting = timeGreeting();

  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        hitSlop={8}
        style={styles.iconBtn}>
        <View style={styles.avatar}>
          <Text style={[typography.captionMedium, { color: colors.primary }]}>
            {name ? name.charAt(0).toUpperCase() : 'Y'}
          </Text>
        </View>
      </Pressable>

      <View style={styles.center}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {greeting}
          {name ? `, ${name}` : ''}
        </Text>
        <Text style={[typography.bodyMedium, styles.title, { color: colors.text }]}>{dateTitle}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/track')}
        accessibilityRole="button"
        accessibilityLabel="Open calendar"
        hitSlop={8}
        style={styles.iconBtn}>
        <Ionicons name="calendar-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 18,
  },
});
