import { differenceInCalendarDays, format, parseISO } from 'date-fns';

/** Max days of bleeding we allow in one logged period (clinical norm is ~3–8). */
export const MAX_PERIOD_BLEEDING_DAYS = 10;

export const FUTURE_DATE_MESSAGE = "Period dates can't be in the future.";

export const PERIOD_TOO_LONG_MESSAGE = `Most periods last up to ${MAX_PERIOD_BLEEDING_DAYS} days. Check your start and end dates — if bleeding is longer, please see a clinician.`;

/** Inclusive bleed length from start through end (or through today when ongoing). */
export function periodBleedingDays(
  start: string,
  end: string | null | undefined,
  today: string = format(new Date(), 'yyyy-MM-dd'),
): number {
  const effectiveEnd = end ?? today;
  return differenceInCalendarDays(parseISO(effectiveEnd), parseISO(start)) + 1;
}

export function isFutureDate(date: string, today: string = format(new Date(), 'yyyy-MM-dd')): boolean {
  return date > today;
}

export function isPeriodTooLong(
  start: string,
  end: string | null | undefined,
  today: string = format(new Date(), 'yyyy-MM-dd'),
): boolean {
  return periodBleedingDays(start, end, today) > MAX_PERIOD_BLEEDING_DAYS;
}

/** Validate start/end for save — returns user-facing error or undefined. */
export function validatePeriodDates(
  start: string,
  end: string | null | undefined,
  today: string = format(new Date(), 'yyyy-MM-dd'),
): string | undefined {
  if (isFutureDate(start, today)) return FUTURE_DATE_MESSAGE;
  if (end && isFutureDate(end, today)) return FUTURE_DATE_MESSAGE;
  if (end && end < start) return 'End date cannot be before the start date.';
  if (isPeriodTooLong(start, end, today)) return PERIOD_TOO_LONG_MESSAGE;
  return undefined;
}

/** Block selecting an end day that would make the range unrealistically long. */
export function wouldPeriodBeTooLong(
  start: string,
  candidateEnd: string,
  today: string = format(new Date(), 'yyyy-MM-dd'),
): boolean {
  if (candidateEnd < start) return false;
  return isPeriodTooLong(start, candidateEnd, today);
}
