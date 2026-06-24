import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'intro',
};

export default function ScreenerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
