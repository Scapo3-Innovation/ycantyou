import type { Goal } from '@/types/database';

/** Short, goal-focused tips for the home banner. */
export const GOAL_TIPS: Record<Goal, string> = {
  cycle: 'Log flow and symptoms daily — patterns become clearer after two full cycles.',
  fertility: 'Track cervical mucus and symptoms alongside dates. Estimates are uncertain with irregular cycles.',
  symptoms: 'Note what you eat, sleep, and stress on tough days — it helps spot triggers over time.',
  weight: 'Small, steady changes beat crash diets. Log how you feel, not just the scale.',
  mood: 'Mood and energy often shift with your cycle phase. A quick daily check-in helps you see the link.',
};

export function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName: string | null | undefined): string | null {
  const name = fullName?.trim().split(/\s+/)[0];
  return name ? name : null;
}
