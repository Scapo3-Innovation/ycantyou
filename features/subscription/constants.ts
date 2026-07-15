import type { Ionicons } from '@expo/vector-icons';

export type SubscriptionPlanId = 'monthly' | 'yearly';

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  label: string;
  price: string;
  period: string;
  savings?: string;
};

export type PremiumFeature = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  shortTitle: string;
  description: string;
  tint: 'rose' | 'teal';
};

export const PREMIUM_TRIAL_DAYS = 14;

export const PREMIUM_PLANS: readonly SubscriptionPlan[] = [
  { id: 'monthly', label: 'Monthly', price: '₹49', period: 'per month' },
  { id: 'yearly', label: 'Yearly', price: '₹399', period: 'per year', savings: 'Save 32%' },
] as const;

export const PREMIUM_FEATURES: readonly PremiumFeature[] = [
  {
    icon: 'sparkles-outline',
    title: 'Advanced health insights',
    shortTitle: 'Advanced insights',
    description: 'Deeper trends, phase patterns, and personalized summaries',
    tint: 'rose',
  },
  {
    icon: 'pulse-outline',
    title: 'Unlimited tracking',
    shortTitle: 'Unlimited tracking',
    description: 'Symptoms, cycles, mood, and daily logs without limits',
    tint: 'teal',
  },
  {
    icon: 'nutrition-outline',
    title: 'Lifestyle & meal plans',
    shortTitle: 'Lifestyle plans',
    description: 'PCOS-friendly routines tailored to your goals',
    tint: 'rose',
  },
  {
    icon: 'people-outline',
    title: 'Partner sharing',
    shortTitle: 'Partner sharing',
    description: 'Share selected insights with your partner securely',
    tint: 'teal',
  },
] as const;
