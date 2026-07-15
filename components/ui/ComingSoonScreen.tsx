import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Screen } from '@/components/ui/Screen';
import { colors, spacing, typography } from '@/theme';

type ComingSoonScreenProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description?: string;
};

/** Placeholder for tabs shipping in a future release. */
export function ComingSoonScreen({
  title,
  icon,
  description = 'We are building something thoughtful for you.',
}: ComingSoonScreenProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 1100 }), withTiming(1, { duration: 1100 })),
      -1,
      true,
    );
  }, [pulse]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Screen>
      <View style={styles.wrap}>
        <Animated.View entering={FadeInDown.duration(520).springify()} style={styles.content}>
          <Animated.View style={[styles.iconWrap, iconStyle]}>
            <Ionicons name={icon} size={34} color={colors.primary} />
          </Animated.View>

          <Animated.Text
            entering={FadeIn.delay(120).duration(420)}
            style={[typography.captionMedium, styles.eyebrow, { color: colors.primary }]}>
            {title}
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(200).duration(420)}
            style={[typography.h1, styles.headline, { color: colors.text }]}>
            Coming soon
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(280).duration(420)}
            style={[typography.body, styles.subcopy, { color: colors.textMuted }]}>
            Next version — stay tuned
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(360).duration(420)}
            style={[typography.caption, styles.description, { color: colors.textFaint }]}>
            {description}
          </Animated.Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 320,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headline: {
    textAlign: 'center',
  },
  subcopy: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
});
