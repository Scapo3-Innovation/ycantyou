import AsyncStorage from '@react-native-async-storage/async-storage';

import { TOUR_STORAGE_PREFIX } from './constants';

function tourKey(userId: string): string {
  return `${TOUR_STORAGE_PREFIX}:${userId}`;
}

export async function getTourCompleted(userId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(tourKey(userId));
  return value === 'true';
}

export async function setTourCompleted(userId: string): Promise<void> {
  await AsyncStorage.setItem(tourKey(userId), 'true');
}

export async function clearTourCompleted(userId: string): Promise<void> {
  await AsyncStorage.removeItem(tourKey(userId));
}
