import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing, typography } from '@/theme';

type ScrollHintProps = {
  visible: boolean;
  bottomInset?: number;
};

/** Bouncing chevron hint — fades out once the user scrolls. */
export function ScrollHint({ visible, bottomInset = 0 }: ScrollHintProps) {
  const offsetY = useSharedValue(0);

  useEffect(() => {
    offsetY.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [offsetY]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(280)}
      pointerEvents="none"
      style={[styles.wrap, { bottom: bottomInset + spacing.lg }]}>
      <Animated.View style={chevronStyle}>
        <Ionicons name="chevron-down" size={24} color={colors.primary} />
      </Animated.View>
      <Text style={[typography.captionMedium, styles.label, { color: colors.textMuted }]}>
        Scroll to read
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    letterSpacing: 0.2,
  },
});
