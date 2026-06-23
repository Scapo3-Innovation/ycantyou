import { create } from 'zustand';

/**
 * Placeholder global UI store — wires up Zustand so later modules have a pattern to follow.
 * Real feature state (auth session, tracking drafts, etc.) should live in its own stores.
 */
type AppState = {
  /** Flips true once the app has finished its initial bootstrap. */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),
}));
