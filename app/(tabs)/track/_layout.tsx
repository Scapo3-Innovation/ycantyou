import { Stack } from 'expo-router';

// The Track tab is a stack: calendar (index) → day log / period editor.
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TrackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
