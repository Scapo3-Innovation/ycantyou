import { differenceInCalendarDays, format, parseISO } from 'date-fns';

/** Max days of bleeding we allow in one logged period (clinical norm is ~3–8). */
export const MAX_PERIOD_BLEEDING_DAYS = 10;

export const FUTURE_DATE_MESSAGE = "Period dates can't be in the future.";

export const PERIOD_TOO_LONG_MESSAGE = `Most periods last up to ${MAX_PERIOD_BLEEDING_DAYS} days. Check your start and end dates — if bleeding is longer, please see a clinician.`;

export const PAST_PERIOD_NEEDS_END_MESSAGE =
  'For a past period, tap the last day of bleeding on the calendar — not just the start day.';

/** Inclusive bleed length from start through end (both required). */
export function periodBleedingDays(start: string, end: string): number {
  return differenceInCalendarDays(parseISO(end), parseISO(start)) + 1;
}

/** Inclusive days for an ongoing period (start through today). */
export function ongoingBleedingDays(
  start: string,
  today: string = format(new Date(), 'yyyy-MM-dd'),
): number {
  return periodBleedingDays(start, today);
}

export function isFutureDate(date: string, today: string = format(new Date(), 'yyyy-MM-dd')): boolean {
  return date > today;
}

/** True when the logged range exceeds the cap. Requires end for completed past periods. */
export function isPeriodTooLong(
  start: string,
  end: string | null | undefined,
  today: string = format(new Date(), 'yyyy-MM-dd'),
): boolean {
  if (end) {
    return periodBleedingDays(start, end) > MAX_PERIOD_BLEEDING_DAYS;
  }
  return ongoingBleedingDays(start, today) > MAX_PERIOD_BLEEDING_DAYS;
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
  if (end) {
    if (isPeriodTooLong(start, end, today)) return PERIOD_TOO_LONG_MESSAGE;
    return undefined;
  }
  if (ongoingBleedingDays(start, today) > MAX_PERIOD_BLEEDING_DAYS) {
    return PAST_PERIOD_NEEDS_END_MESSAGE;
  }
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
