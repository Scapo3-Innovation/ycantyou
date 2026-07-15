import { Stack } from 'expo-router';

import { CommunityFeedbackProvider } from '@/features/community/CommunityFeedbackContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function CommunityLayout() {
  return (
    <CommunityFeedbackProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />
    </CommunityFeedbackProvider>
  );
}
