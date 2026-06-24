import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'onboarding.seen_welcome';

/**
 * Tracks whether the intro carousel has been seen, so returning (signed-out) users go
 * straight to sign-in. `seen` is null while loading.
 */
export function useHasSeenWelcome() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (mounted) setSeen(value === 'true');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const markSeen = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setSeen(true);
  }, []);

  return { seen, markSeen };
}
