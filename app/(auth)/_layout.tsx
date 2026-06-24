import { Stack } from 'expo-router';

// First launch shows welcome; returning users skip to sign-in unless replay=1.
export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
