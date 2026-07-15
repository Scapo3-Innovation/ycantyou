import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const CONSENT_KEY = 'community_consent_v1';

/** Whether the user has accepted the community guidelines sheet. */
export function useCommunityConsent() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    void AsyncStorage.getItem(CONSENT_KEY).then((value) => {
      setAccepted(value === 'true');
    });
  }, []);

  const accept = useCallback(async () => {
    await AsyncStorage.setItem(CONSENT_KEY, 'true');
    setAccepted(true);
  }, []);

  return { accepted, accept, loading: accepted === null };
}
