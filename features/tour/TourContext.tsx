import { useRouter, type Href } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type { View } from 'react-native';

import { analytics } from '@/lib/analytics';

import { GUIDED_TOUR_STEPS } from './constants';
import { getTourCompleted, setTourCompleted } from './storage';
import type { TourAnchorRect, TourStep } from './types';

type AnchorMeasure = () => Promise<TourAnchorRect | null>;

type TourContextValue = {
  isActive: boolean;
  stepIndex: number;
  step: TourStep | null;
  totalSteps: number;
  registerAnchor: (id: string, ref: RefObject<View | null>) => void;
  unregisterAnchor: (id: string) => void;
  measureAnchor: (id: string) => Promise<TourAnchorRect | null>;
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => Promise<void>;
  completeTour: () => Promise<void>;
};

const TourContext = createContext<TourContextValue | null>(null);

const NAV_SETTLE_MS = 520;

export function TourProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | undefined;
}) {
  const router = useRouter();
  const anchorsRef = useRef(new Map<string, AnchorMeasure>());
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const step = isActive ? (GUIDED_TOUR_STEPS[stepIndex] ?? null) : null;
  const totalSteps = GUIDED_TOUR_STEPS.length;

  const registerAnchor = useCallback((id: string, ref: RefObject<View | null>) => {
    anchorsRef.current.set(id, async () => {
      const measureOnce = () =>
        new Promise<TourAnchorRect | null>((resolve) => {
          const node = ref.current;
          if (!node) {
            resolve(null);
            return;
          }
          node.measureInWindow((x, y, width, height) => {
            if (width <= 0 || height <= 0) {
              resolve(null);
              return;
            }
            resolve({ x, y, width, height });
          });
        });

      let rect = await measureOnce();
      if (!rect) {
        await new Promise((r) => setTimeout(r, 80));
        rect = await measureOnce();
      }
      return rect;
    });
  }, []);

  const unregisterAnchor = useCallback((id: string) => {
    anchorsRef.current.delete(id);
  }, []);

  const measureAnchor = useCallback(async (id: string) => {
    const measure = anchorsRef.current.get(id);
    if (!measure) return null;
    return measure();
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      const target = GUIDED_TOUR_STEPS[index];
      if (!target) return;
      setStepIndex(index);
      router.navigate(target.route as Href);
    },
    [router],
  );

  const startTour = useCallback(() => {
    setStepIndex(0);
    setIsActive(true);
    router.navigate(GUIDED_TOUR_STEPS[0]!.route as Href);
    analytics.track('guided_tour_started');
  }, [router]);

  const completeTour = useCallback(async () => {
    setIsActive(false);
    setStepIndex(0);
    if (userId) await setTourCompleted(userId);
    analytics.track('guided_tour_completed');
  }, [userId]);

  const skipTour = useCallback(async () => {
    setIsActive(false);
    setStepIndex(0);
    if (userId) await setTourCompleted(userId);
    analytics.track('guided_tour_skipped');
  }, [userId]);

  const nextStep = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= GUIDED_TOUR_STEPS.length) {
      void completeTour();
      return;
    }
    goToStep(next);
  }, [completeTour, goToStep, stepIndex]);

  const value = useMemo<TourContextValue>(
    () => ({
      isActive,
      stepIndex,
      step,
      totalSteps,
      registerAnchor,
      unregisterAnchor,
      measureAnchor,
      startTour,
      nextStep,
      skipTour,
      completeTour,
    }),
    [
      isActive,
      stepIndex,
      step,
      totalSteps,
      registerAnchor,
      unregisterAnchor,
      measureAnchor,
      startTour,
      nextStep,
      skipTour,
      completeTour,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}

export function useTourOptional(): TourContextValue | null {
  return useContext(TourContext);
}

export { NAV_SETTLE_MS };

export async function shouldAutoStartTour(userId: string): Promise<boolean> {
  return !(await getTourCompleted(userId));
}
