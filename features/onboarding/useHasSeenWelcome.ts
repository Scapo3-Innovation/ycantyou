import { useCallback, useEffect, useState } from 'react';

import { getWelcomeSeen, setWelcomeSeen } from './welcomeStorage';

/**
 * Tracks whether the intro carousel has been seen on this signed-out visit.
 * After Skip / Get started the user goes to sign-in; logging out resets the flag.
 * `seen` is null while loading.
 */
export function useHasSeenWelcome() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getWelcomeSeen().then((value) => {
      if (mounted) setSeen(value);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const markSeen = useCallback(async () => {
    await setWelcomeSeen();
    setSeen(true);
  }, []);

  return { seen, markSeen };
}
