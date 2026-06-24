import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

type FadeInViewProps = {
  children: ReactNode;
  /** Stagger delay in ms before the entrance animation starts. */
  delay?: number;
};

/** Gentle slide-up + fade entrance for form sections and cards. */
export function FadeInView({ children, delay = 0 }: FadeInViewProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(480).springify().damping(18)}>
      {children}
    </Animated.View>
  );
}
