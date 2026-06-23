import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/AuthProvider';
import type { Cycle, DailyLogWithSymptoms } from '@/types/database';

import {
  insertCycle,
  softDeleteCycle,
  softDeleteDailyLog,
  updateCycle,
  upsertDailyLog,
} from './api';
import { trackingKeys } from './queries';
import type { DailyLogForm, PeriodForm } from './validation';

const nowIso = () => new Date().toISOString();

/** Sort cycles newest-first to match the server ordering. */
const byStartDesc = (a: Cycle, b: Cycle) => (a.start_date < b.start_date ? 1 : -1);

/**
 * Root prefix of the Module 5 insights query keys. Logging/editing cycles or daily logs
 * changes the server-aggregated insights, so we invalidate them here. Referenced as a
 * literal prefix (not imported from features/insights) to avoid a circular dependency —
 * the insights feature already imports from tracking.
 */
const INSIGHTS_ROOT = ['insights'] as const;

// --- Cycles -----------------------------------------------------------------

/** Log a new period, optimistically prepending it to the cycle list. */
export function useLogPeriod() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const key = trackingKeys.cycles(userId);

  return useMutation({
    mutationFn: (form: PeriodForm) => insertCycle(userId as string, form),
    onMutate: async (form) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Cycle[]>(key);
      const optimistic: Cycle = {
        id: `temp-${Date.now()}`,
        user_id: userId as string,
        start_date: form.start_date,
        end_date: form.end_date ?? null,
        is_predicted: false,
        notes: form.notes ?? null,
        created_at: nowIso(),
        updated_at: nowIso(),
        deleted_at: null,
      };
      qc.setQueryData<Cycle[]>(key, [...(previous ?? []), optimistic].sort(byStartDesc));
      return { previous };
    },
    onError: (_e, _form, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: INSIGHTS_ROOT });
    },
  });
}

/** Edit an existing period, optimistically replacing it in the list. */
export function useUpdatePeriod() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const key = trackingKeys.cycles(userId);

  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: PeriodForm }) => updateCycle(id, form),
    onMutate: async ({ id, form }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Cycle[]>(key);
      qc.setQueryData<Cycle[]>(
        key,
        (previous ?? [])
          .map((c) =>
            c.id === id
              ? { ...c, start_date: form.start_date, end_date: form.end_date ?? null, notes: form.notes ?? null }
              : c,
          )
          .sort(byStartDesc),
      );
      return { previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: INSIGHTS_ROOT });
    },
  });
}

/** Soft-delete a period, optimistically removing it from the list. */
export function useDeletePeriod() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const key = trackingKeys.cycles(userId);

  return useMutation({
    mutationFn: (id: string) => softDeleteCycle(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Cycle[]>(key);
      qc.setQueryData<Cycle[]>(key, (previous ?? []).filter((c) => c.id !== id));
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: INSIGHTS_ROOT });
    },
  });
}

// --- Daily logs -------------------------------------------------------------

/** Create/update a daily log, optimistically updating both the day and the recent list. */
export function useUpsertDailyLog(date: string) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const dayKey = trackingKeys.dailyLog(userId, date);
  const recentKey = trackingKeys.recentLogs(userId);

  return useMutation({
    mutationFn: (form: DailyLogForm) => upsertDailyLog(userId as string, date, form),
    onMutate: async (form) => {
      await qc.cancelQueries({ queryKey: dayKey });
      await qc.cancelQueries({ queryKey: recentKey });
      const previousDay = qc.getQueryData<DailyLogWithSymptoms | null>(dayKey);
      const previousRecent = qc.getQueryData<DailyLogWithSymptoms[]>(recentKey);

      const optimistic: DailyLogWithSymptoms = {
        id: previousDay?.id ?? `temp-${Date.now()}`,
        user_id: userId as string,
        log_date: date,
        flow_level: form.flow_level ?? null,
        mood: form.mood ?? null,
        energy: form.energy ?? null,
        notes: form.notes ?? null,
        created_at: previousDay?.created_at ?? nowIso(),
        updated_at: nowIso(),
        deleted_at: null,
        symptom_codes: form.symptom_codes,
      };
      qc.setQueryData<DailyLogWithSymptoms | null>(dayKey, optimistic);
      if (previousRecent) {
        const others = previousRecent.filter((l) => l.log_date !== date);
        qc.setQueryData(recentKey, [optimistic, ...others]);
      }
      return { previousDay, previousRecent };
    },
    onError: (_e, _form, ctx) => {
      if (ctx) {
        qc.setQueryData(dayKey, ctx.previousDay);
        if (ctx.previousRecent) qc.setQueryData(recentKey, ctx.previousRecent);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: dayKey });
      void qc.invalidateQueries({ queryKey: recentKey });
      void qc.invalidateQueries({ queryKey: INSIGHTS_ROOT });
    },
  });
}

/** Soft-delete the daily log for a date, optimistically clearing it. */
export function useDeleteDailyLog(date: string) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const dayKey = trackingKeys.dailyLog(userId, date);
  const recentKey = trackingKeys.recentLogs(userId);

  return useMutation({
    mutationFn: (id: string) => softDeleteDailyLog(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: dayKey });
      await qc.cancelQueries({ queryKey: recentKey });
      const previousDay = qc.getQueryData<DailyLogWithSymptoms | null>(dayKey);
      const previousRecent = qc.getQueryData<DailyLogWithSymptoms[]>(recentKey);
      qc.setQueryData<DailyLogWithSymptoms | null>(dayKey, null);
      if (previousRecent) {
        qc.setQueryData(recentKey, previousRecent.filter((l) => l.log_date !== date));
      }
      return { previousDay, previousRecent };
    },
    onError: (_e, _id, ctx) => {
      if (ctx) {
        qc.setQueryData(dayKey, ctx.previousDay);
        if (ctx.previousRecent) qc.setQueryData(recentKey, ctx.previousRecent);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: dayKey });
      void qc.invalidateQueries({ queryKey: recentKey });
      void qc.invalidateQueries({ queryKey: INSIGHTS_ROOT });
    },
  });
}
