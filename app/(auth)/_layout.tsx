import { Stack } from 'expo-router';

// Ensure the group anchors on the email-entry screen (verify needs an email param).
export const unstable_settings = {
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
