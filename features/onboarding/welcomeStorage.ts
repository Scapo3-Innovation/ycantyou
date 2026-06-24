import AsyncStorage from '@react-native-async-storage/async-storage';

export const WELCOME_SEEN_KEY = 'onboarding.seen_welcome';

export async function getWelcomeSeen(): Promise<boolean> {
  const value = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
  return value === 'true';
}

export async function setWelcomeSeen(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
}

/** Clears the flag so the intro carousel shows again (e.g. after logout). */
export async function clearWelcomeSeen(): Promise<void> {
  await AsyncStorage.removeItem(WELCOME_SEEN_KEY);
}
