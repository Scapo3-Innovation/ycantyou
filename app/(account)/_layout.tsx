import { Stack } from 'expo-router';

// Signed-in-only routes that sit outside the tab bar (e.g. the guest account-upgrade flow).
export default function AccountLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
