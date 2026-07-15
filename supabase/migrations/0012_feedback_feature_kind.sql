-- Allow "feature" as a feedback category alongside bug and feedback.

alter table public.user_feedback
  drop constraint if exists user_feedback_kind_check;

alter table public.user_feedback
  add constraint user_feedback_kind_check
  check (kind in ('bug', 'feature', 'feedback'));
