import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '@/theme';

import { TourAnchor } from '@/features/tour/TourAnchor';

const NAV_SCALE = 1.05;
const TAB_ROW_HEIGHT = Math.round(44 * NAV_SCALE);
const INACTIVE_TAB_SIZE = Math.round(44 * NAV_SCALE);
const TAB_ICON_SIZE = Math.round(20 * NAV_SCALE);
const PILL_INSET = Math.round(spacing.sm * NAV_SCALE);
const TAB_GAP = spacing.xs;
const TAB_SPRING = { damping: 22, stiffness: 280, mass: 0.75 };

const USE_NATIVE_GLASS = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type TabDescriptorOptions = {
  title?: string;
  href?: string | null;
  tabBarAccessibilityLabel?: string;
  tabBarItemStyle?: unknown;
  tabBarButton?: unknown;
};

function isRouteHidden(
  routeName: string,
  options: TabDescriptorOptions,
  visibleRoutes?: readonly string[],
): boolean {
  if (visibleRoutes && !visibleRoutes.includes(routeName)) return true;
  if (options.href === null) return true;
  if (options.tabBarButton === null) return true;
  const itemStyle = options.tabBarItemStyle;
  if (
    itemStyle &&
    typeof itemStyle === 'object' &&
    'display' in itemStyle &&
    itemStyle.display === 'none'
  ) {
    return true;
  }
  return false;
}

export type FloatingPillTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  descriptors: Record<string, { options?: TabDescriptorOptions }>;
  navigation: unknown;
  visibleRoutes?: readonly string[];
  /** Active pill fill — brand primary by default. */
  accentColor?: string;
  activeFill?: string;
  activeLabelColor?: string;
  inactiveIconColor?: string;
  inactiveCircleFill?: string;
};

type TabBarNavigation = {
  emit: (event: {
    type: 'tabPress' | 'tabLongPress';
    target: string;
    canPreventDefault?: boolean;
  }) => { defaultPrevented?: boolean };
  navigate: (name: string, params?: object) => void;
};

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { outline: TabIconName; filled: TabIconName }> = {
  index: { outline: 'home-outline', filled: 'home' },
  partner: { outline: 'heart-outline', filled: 'heart' },
  track: { outline: 'calendar-outline', filled: 'calendar' },
  community: { outline: 'people-outline', filled: 'people' },
  analytics: { outline: 'stats-chart-outline', filled: 'stats-chart' },
  calendar: { outline: 'calendar-outline', filled: 'calendar' },
  plan: { outline: 'airplane-outline', filled: 'airplane' },
  learn: { outline: 'book-outline', filled: 'book' },
  profile: { outline: 'person-outline', filled: 'person' },
};

function computeActiveTabWidth(pillWidth: number, tabCount: number) {
  const innerWidth = pillWidth - PILL_INSET * 2;
  const inactiveCount = Math.max(tabCount - 1, 0);
  const totalGaps = Math.max(tabCount - 1, 0) * TAB_GAP;
  return Math.max(
    innerWidth - inactiveCount * INACTIVE_TAB_SIZE - totalGaps,
    INACTIVE_TAB_SIZE,
  );
}

type GlassPillShellProps = {
  width: number;
  accentColor: string;
  children: ReactNode;
};

function GlassPillShell({ width, accentColor, children }: GlassPillShellProps) {
  const shellStyle = [styles.pillShell, { width }];
  const ringColor =
    accentColor === colors.secondary ? colors.glass.pillRingTeal : colors.glass.pillRing;
  const glowColor =
    accentColor === colors.secondary ? colors.glass.pillGlowTeal : colors.glass.pillGlowRose;

  if (USE_NATIVE_GLASS) {
    return (
      <View style={[styles.pillFloat, { width }]}>
        <View style={[styles.pillAccentGlow, { backgroundColor: glowColor }]} pointerEvents="none" />
        <GlassView
          style={shellStyle}
          glassEffectStyle="regular"
          colorScheme="light"
          tintColor={colors.glass.pillTint}>
          <View style={styles.glassClip} pointerEvents="none">
            <View style={[styles.pillRing, { borderColor: ringColor }]} />
            <View style={styles.glassTintOverlay} />
          </View>
          <View style={styles.tabRow}>{children}</View>
        </GlassView>
      </View>
    );
  }

  return (
    <View style={[styles.pillFloat, { width }]}>
      <View style={[styles.pillAccentGlow, { backgroundColor: glowColor }]} pointerEvents="none" />
      <View style={[shellStyle, styles.glassShell]}>
        <View style={styles.glassClip} pointerEvents="none">
          <BlurView intensity={Platform.OS === 'ios' ? 52 : 80} tint="light" style={styles.glassBackdrop} />
          <LinearGradient
            colors={[colors.glass.pillHighlight, colors.glass.pillFill, colors.glass.pillTint]}
            locations={[0, 0.42, 1]}
            style={styles.glassBackdrop}
          />
          <View style={[styles.pillRing, { borderColor: ringColor }]} />
          <View style={styles.glassSheen} />
        </View>
        <View style={styles.tabRow}>{children}</View>
      </View>
    </View>
  );
}

type TabSlotProps = {
  focused: boolean;
  activeWidth: number;
  label: string;
  iconName: TabIconName;
  inactiveIconColor: string;
  inactiveCircleFill: string;
  activeFill: string;
  activeLabelColor: string;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
};

/** Circle when inactive → solid accent pill with label when active. */
function TabSlot({
  focused,
  activeWidth,
  label,
  iconName,
  inactiveIconColor,
  inactiveCircleFill,
  activeFill,
  activeLabelColor,
  accessibilityLabel,
  onPress,
  onLongPress,
}: TabSlotProps) {
  const slotWidth = useSharedValue(focused ? activeWidth : INACTIVE_TAB_SIZE);
  const focusProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    slotWidth.value = withSpring(focused ? activeWidth : INACTIVE_TAB_SIZE, TAB_SPRING);
    focusProgress.value = withTiming(focused ? 1 : 0, { duration: focused ? 250 : 180 });
  }, [activeWidth, focusProgress, focused, slotWidth]);

  const slotStyle = useAnimatedStyle(() => ({
    width: slotWidth.value,
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [inactiveCircleFill, activeFill],
    ),
    shadowOpacity: 0.12 * focusProgress.value,
    elevation: focusProgress.value * 4,
  }));

  const labelWrapStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    maxWidth: Math.max(slotWidth.value - TAB_ICON_SIZE - 14, 0),
    marginLeft: focusProgress.value * 6,
    transform: [{ scale: 0.92 + focusProgress.value * 0.08 }],
  }));

  const iconColor = focused ? activeLabelColor : inactiveIconColor;
  const labelColor = activeLabelColor;

  return (
    <Animated.View style={[styles.tab, slotStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.tabPressable, pressed && styles.tabPressed]}>
        <Ionicons name={iconName} size={TAB_ICON_SIZE} color={iconColor} />
        <Animated.View style={[styles.labelWrap, labelWrapStyle]}>
          <Animated.Text
            numberOfLines={1}
            style={[typography.captionMedium, styles.label, { color: labelColor }]}>
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

/** Floating pill bottom bar — glass track with expanding active capsule. */
export function FloatingPillTabBar({
  state,
  descriptors,
  navigation,
  visibleRoutes,
  accentColor = colors.primary,
  activeFill = colors.primary,
  activeLabelColor = colors.primaryText,
  inactiveIconColor = colors.primary,
  inactiveCircleFill = colors.glass.inactiveCircle,
}: FloatingPillTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const nav = navigation as TabBarNavigation;

  const routes = state.routes.filter((route) => {
    const descriptor = descriptors[route.key];
    const options = descriptor?.options ?? {};
    return !isRouteHidden(route.name, options, visibleRoutes);
  });

  const focusedRoute = state.routes[state.index];
  const pillWidth = windowWidth - spacing.lg * 2;
  const activeTabWidth = computeActiveTabWidth(pillWidth, routes.length);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.outer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <TourAnchor id="tour-tab-bar">
        <GlassPillShell width={pillWidth} accentColor={accentColor}>
        {routes.map((route) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};
          const isFocused = focusedRoute?.key === route.key;
          const label = options.title ?? route.name;
          const icons = TAB_ICONS[route.name];
          const iconName = icons
            ? isFocused
              ? icons.filled
              : icons.outline
            : 'ellipse-outline';

          const onPress = () => {
            if (Platform.OS !== 'web') {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = nav.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              nav.navigate(route.name, route.params);
            }
          };

          return (
            <TabSlot
              key={route.key}
              focused={isFocused}
              activeWidth={activeTabWidth}
              label={label}
              iconName={iconName}
              inactiveIconColor={inactiveIconColor}
              inactiveCircleFill={inactiveCircleFill}
              activeFill={activeFill}
              activeLabelColor={activeLabelColor}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={() => nav.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
        </GlassPillShell>
      </TourAnchor>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  pillFloat: {
    borderRadius: radius.full,
    ...shadows.tabBar,
  },
  pillAccentGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    bottom: -6,
    height: 14,
    borderRadius: radius.full,
    opacity: 0.85,
  },
  pillShell: {
    borderRadius: radius.full,
    paddingHorizontal: PILL_INSET,
    paddingVertical: PILL_INSET,
  },
  glassClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  glassShell: {
    borderWidth: 1,
    borderColor: colors.glass.pillBorder,
    backgroundColor: colors.glass.pillFill,
  },
  pillRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  glassBackdrop: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.glass.pillTint,
    borderRadius: radius.full,
  },
  glassSheen: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.glass.sheen,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TAB_GAP,
    zIndex: 1,
  },
  tab: {
    height: TAB_ROW_HEIGHT,
    borderRadius: radius.full,
    ...shadows.tabActive,
  },
  tabPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_ROW_HEIGHT,
    paddingHorizontal: spacing.sm,
  },
  labelWrap: {
    overflow: 'hidden',
  },
  tabPressed: {
    opacity: 0.9,
  },
  label: {
    flexShrink: 0,
  },
});
