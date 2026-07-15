import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainTabsTabBar } from '@/components/ui/MainTabsTabBar';
import { PeriodLogPromptHost } from '@/features/tracking/PeriodLogPromptHost';
import { FLOATING_TAB_BAR_HEIGHT, spacing } from '@/theme';

type TabIconProps = {
  color: ColorValue;
  size: number;
};

/** Bottom tab shell — Home, Partner, Track, Community, Analytics. Profile opens from home avatar. */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = FLOATING_TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.sm);

  return (
    <>
      <Tabs
        tabBar={(props) => <MainTabsTabBar {...props} />}
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
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="partner"
          options={{
            title: 'Partner',
            tabBarIcon: ({ color, size }: TabIconProps) => (
              <Ionicons name="heart-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="track"
          options={{
            title: 'Track',
            tabBarIcon: ({ color, size }: TabIconProps) => (
              <Ionicons name="calendar-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Feed',
            tabBarIcon: ({ color, size }: TabIconProps) => (
              <Ionicons name="people-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }: TabIconProps) => (
              <Ionicons name="stats-chart-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="learn" options={{ href: null }} />
      </Tabs>
      <PeriodLogPromptHost />
    </>
  );
}
