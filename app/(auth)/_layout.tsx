import { Stack } from 'expo-router';

// Start on the welcome carousel; it redirects returning users straight to sign-in.
export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
