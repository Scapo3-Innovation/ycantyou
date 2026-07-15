import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, FLOATING_TAB_BAR_HEIGHT, radius, shadows, spacing, typography } from '@/theme';

import { NAV_SETTLE_MS, useTour } from './TourContext';
import {
  buildDimOverlayPath,
  clampSpotlightRect,
  resolveSpotlightRadius,
  type SpotlightShape,
} from './spotlight';

const SPOTLIGHT_PAD = 6;
const TRANSITION_MS = 320;
const DIM_COLOR = 'rgba(0,0,0,0.52)';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type TooltipPlacement = 'bottom' | 'top' | 'center';

type AnimatedDimOverlayProps = {
  windowWidth: number;
  windowHeight: number;
  spotlightShape?: SpotlightShape;
  holeX: SharedValue<number>;
  holeY: SharedValue<number>;
  holeW: SharedValue<number>;
  holeH: SharedValue<number>;
  hasHole: SharedValue<number>;
};

/** Dim overlay with a rounded cutout that matches the spotlight ring. */
function AnimatedDimOverlay({
  windowWidth,
  windowHeight,
  spotlightShape,
  holeX,
  holeY,
  holeW,
  holeH,
  hasHole,
}: AnimatedDimOverlayProps) {
  const animatedProps = useAnimatedProps(() => {
    const w = holeW.value;
    const h = holeH.value;
    const r = resolveSpotlightRadius(w, h, spotlightShape);
    return {
      d: buildDimOverlayPath(
        windowWidth,
        windowHeight,
        holeX.value,
        holeY.value,
        w,
        h,
        r,
        hasHole.value,
      ),
    };
  }, [spotlightShape, windowWidth, windowHeight]);

  return (
    <Svg
      width={windowWidth}
      height={windowHeight}
      style={StyleSheet.absoluteFill}
      pointerEvents="none">
      <AnimatedPath animatedProps={animatedProps} fill={DIM_COLOR} fillRule="evenodd" />
    </Svg>
  );
}

export function GuidedTourOverlay() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { isActive, step, stepIndex, totalSteps, measureAnchor, nextStep, skipTour } = useTour();

  const [tooltipPlacement, setTooltipPlacement] = useState<TooltipPlacement>('bottom');

  const holeX = useSharedValue(0);
  const holeY = useSharedValue(0);
  const holeW = useSharedValue(0);
  const holeH = useSharedValue(0);
  const hasHole = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  const spotlightShape = step?.spotlightShape;

  const ringStyle = useAnimatedStyle(() => {
    const w = holeW.value;
    const h = holeH.value;
    const borderRadius = resolveSpotlightRadius(w, h, spotlightShape);

    return {
      position: 'absolute',
      top: holeY.value,
      left: holeX.value,
      width: w,
      height: h,
      opacity: ringOpacity.value * hasHole.value,
      borderRadius,
      borderWidth: 2,
      borderColor: colors.primary,
    };
  }, [spotlightShape]);

  useEffect(() => {
    if (!isActive || !step) {
      hasHole.value = withTiming(0, { duration: 180 });
      ringOpacity.value = withTiming(0, { duration: 160 });
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      void (async () => {
        if (!step.anchorId) {
          if (cancelled) return;
          setTooltipPlacement('center');
          hasHole.value = withTiming(0, { duration: 200 });
          ringOpacity.value = withTiming(0, { duration: 160 });
          return;
        }

        const raw = await measureAnchor(step.anchorId);
        if (cancelled) return;

        if (!raw) {
          setTooltipPlacement('center');
          hasHole.value = withTiming(0, { duration: 200 });
          ringOpacity.value = withTiming(0, { duration: 160 });
          return;
        }

        const rect = clampSpotlightRect(raw, windowWidth, windowHeight, SPOTLIGHT_PAD);
        const midY = rect.y + rect.height / 2;

        if (step.placement === 'above' || midY > windowHeight * 0.58) {
          setTooltipPlacement('top');
        } else {
          setTooltipPlacement('bottom');
        }

        holeX.value = withTiming(rect.x, {
          duration: TRANSITION_MS,
          easing: Easing.out(Easing.cubic),
        });
        holeY.value = withTiming(rect.y, {
          duration: TRANSITION_MS,
          easing: Easing.out(Easing.cubic),
        });
        holeW.value = withTiming(rect.width, {
          duration: TRANSITION_MS,
          easing: Easing.out(Easing.cubic),
        });
        holeH.value = withTiming(rect.height, {
          duration: TRANSITION_MS,
          easing: Easing.out(Easing.cubic),
        });
        hasHole.value = withTiming(1, { duration: 220 });
        ringOpacity.value = withTiming(1, { duration: 240 });
      })();
    }, NAV_SETTLE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    isActive,
    measureAnchor,
    step,
    stepIndex,
    windowHeight,
    windowWidth,
    hasHole,
    holeH,
    holeW,
    holeX,
    holeY,
    ringOpacity,
  ]);

  if (!isActive || !step) return null;

  const isLast = stepIndex === totalSteps - 1;
  const tooltipBottom = insets.bottom + FLOATING_TAB_BAR_HEIGHT + spacing.md;
  const tooltipTop = insets.top + spacing.md;

  const tooltipPositionStyle =
    tooltipPlacement === 'center'
      ? styles.tooltipCenter
      : tooltipPlacement === 'top'
        ? { top: tooltipTop }
        : { bottom: tooltipBottom };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.root}>
        <AnimatedDimOverlay
          windowWidth={windowWidth}
          windowHeight={windowHeight}
          spotlightShape={spotlightShape}
          holeX={holeX}
          holeY={holeY}
          holeW={holeW}
          holeH={holeH}
          hasHole={hasHole}
        />
        <Animated.View pointerEvents="none" style={ringStyle} />

        <Animated.View
          key={step.id}
          entering={FadeIn.duration(260).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(180)}
          style={[styles.tooltip, tooltipPositionStyle, { marginHorizontal: spacing.lg }]}>
          <View style={styles.progressRow}>
            <Text style={[typography.captionMedium, { color: colors.textMuted }]}>
              {stepIndex + 1} of {totalSteps}
            </Text>
            <View style={styles.dots}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === stepIndex ? colors.primary : colors.border,
                      width: i === stepIndex ? 14 : 5,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={[typography.bodyMedium, styles.title, { color: colors.text }]}>
            {step.title}
          </Text>
          <Text style={[typography.caption, styles.body, { color: colors.textMuted }]}>
            {step.body}
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={() => void skipTour()} accessibilityRole="button" hitSlop={8}>
              <Text style={[typography.captionMedium, { color: colors.textMuted }]}>Skip</Text>
            </Pressable>
            <Pressable
              onPress={nextStep}
              accessibilityRole="button"
              style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}>
              <Text style={[typography.captionMedium, { color: colors.primaryText }]}>
                {isLast ? 'Done' : 'Next'}
              </Text>
              {!isLast ? (
                <Ionicons name="arrow-forward" size={14} color={colors.primaryText} />
              ) : null}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    maxWidth: 400,
    alignSelf: 'center',
    ...shadows.card,
  },
  tooltipCenter: {
    top: '34%',
    marginHorizontal: spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  body: {
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 36,
  },
  pressed: {
    opacity: 0.9,
  },
});
