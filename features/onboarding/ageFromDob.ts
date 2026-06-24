import { differenceInYears, isValid, parseISO } from 'date-fns';

/** Whole years from an ISO date string (YYYY-MM-DD), or null if invalid. */
export function ageFromDob(dob: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const parsed = parseISO(dob);
  if (!isValid(parsed) || parsed > new Date()) return null;
  return differenceInYears(new Date(), parsed);
}
