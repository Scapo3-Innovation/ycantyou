import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme';

import { TourAnchor } from '@/features/tour/TourAnchor';
import { firstName, timeGreeting } from './homeCopy';

type HomeTopBarProps = {
  today: string;
  selectedDate: string;
  userName?: string | null;
  onGoToToday: () => void;
};

/** Profile · greeting · calendar shortcut. */
export function HomeTopBar({ today, selectedDate, userName, onGoToToday }: HomeTopBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const name = firstName(userName);
  const greeting = timeGreeting();
  const viewingToday = selectedDate === today;

  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      <TourAnchor id="tour-home-profile">
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
      </TourAnchor>

      <View style={styles.center}>
        <Text style={[typography.bodyMedium, styles.greeting, { color: colors.text }]}>
          {greeting}
          {name ? `, ${name}` : ''}
        </Text>
        {!viewingToday ? (
          <Pressable
            onPress={onGoToToday}
            accessibilityRole="button"
            accessibilityLabel="Jump to today"
            hitSlop={8}
            style={({ pressed }) => [styles.todayPill, pressed && styles.todayPillPressed]}>
            <Text style={[typography.captionMedium, { color: colors.primary }]}>Today</Text>
          </Pressable>
        ) : null}
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
    gap: spacing.xs,
  },
  greeting: {
    textAlign: 'center',
  },
  todayPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayPillPressed: {
    opacity: 0.88,
  },
});
