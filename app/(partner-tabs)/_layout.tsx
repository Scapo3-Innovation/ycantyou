import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingPillTabBar } from '@/components/ui/FloatingPillTabBar';
import { colors, FLOATING_TAB_BAR_HEIGHT, spacing } from '@/theme';

type TabIconProps = {
  color: ColorValue;
  size: number;
};

const PARTNER_TAB_ROUTES = ['index', 'calendar', 'plan', 'learn', 'profile'] as const;

/** Partner-only tab shell — separate from the primary user app. */
export default function PartnerTabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = FLOATING_TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.sm);

  return (
    <Tabs
      tabBar={(props) => (
        <FloatingPillTabBar
          {...props}
          visibleRoutes={PARTNER_TAB_ROUTES}
          accentColor={colors.secondary}
          activeFill={colors.secondary}
          activeLabelColor={colors.secondaryText}
          inactiveIconColor={colors.secondary}
        />
      )}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Cal',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="airplane-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
