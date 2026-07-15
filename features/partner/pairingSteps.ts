import type { Ionicons } from '@expo/vector-icons';

export type PairingStepId = 'generate' | 'share' | 'join' | 'customize' | 'connected';

export type PairingStep = {
  id: PairingStepId;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Real-life partner linking journey — shown as a vertical timeline. */
export const PAIRING_STEPS: readonly PairingStep[] = [
  {
    id: 'generate',
    title: 'Get your code',
    body: 'Create a private invite code — valid for 7 days.',
    icon: 'key-outline',
  },
  {
    id: 'share',
    title: 'Send to partner',
    body: 'Share via WhatsApp, text, or say it in person.',
    icon: 'paper-plane-outline',
  },
  {
    id: 'join',
    title: 'Partner signs up',
    body: 'They download ycantyou and enter your code.',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'customize',
    title: 'Choose what to share',
    body: 'Toggle cycle phase, wellness, and trip planning.',
    icon: 'options-outline',
  },
  {
    id: 'connected',
    title: 'Support together',
    body: 'Calendar, forecasts, and gentle support tips.',
    icon: 'heart-outline',
  },
] as const;

export function pairingStepIndex(step: PairingStepId): number {
  return PAIRING_STEPS.findIndex((s) => s.id === step);
}
