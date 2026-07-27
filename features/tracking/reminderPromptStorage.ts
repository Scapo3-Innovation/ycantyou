import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReminderPromptStatus = 'pending' | 'dismissed' | 'enabled';

const keyForUser = (userId: string) => `tracking.reminder_prompt_v1.${userId}`;

export async function getReminderPromptStatus(userId: string): Promise<ReminderPromptStatus> {
  const value = await AsyncStorage.getItem(keyForUser(userId));
  if (value === 'dismissed' || value === 'enabled') return value;
  return 'pending';
}

export async function setReminderPromptStatus(
  userId: string,
  status: ReminderPromptStatus,
): Promise<void> {
  await AsyncStorage.setItem(keyForUser(userId), status);
}
