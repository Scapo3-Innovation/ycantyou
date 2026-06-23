# PCOS / Women's Health App

## Overview
Mobile-first app helping women in India screen for, understand, and manage PCOS/PCOD,
periods, and lifestyle health. Privacy-first. Audience skews young (18–35), Android-first,
multilingual (English + Malayalam/Hindi/Tamil planned).

See @docs/PROJECT_PLAN.md for features and @docs/BUILD_PLAN.md for the 8-module build order.

## Stack
- Frontend: React Native + Expo, TypeScript (strict)
- Backend: Supabase (Postgres, Auth, Storage) with Row-Level Security
- Navigation: Expo Router
- Server state: TanStack Query · Local state: Zustand · Forms: react-hook-form + zod
- Telehealth video: external provider (Phase 2 — do NOT build now)

## Commands
- `npx expo start` — Expo dev server
- `npm run lint` — ESLint
- `npm run typecheck` — tsc --noEmit
- `npm test` — run tests

## Conventions
- TypeScript strict mode. No `any`.
- Components: functional + hooks. One component per file.
- Every DB table has Row-Level Security so a user can only read/write her own rows.
- All user health data is sensitive: minimal collection, explicit consent.
- Commit messages: imperative mood, scoped (e.g. "add cycle log screen").

## CRITICAL — health data & compliance (DPDP Act)
- NEVER hardcode secrets or keys. Use env vars (EXPO_PUBLIC_* for client).
- Use ONLY the Supabase anon key in the app. The service-role key is server-side only.
- NEVER use production credentials or real user data in development. Dev = fake data only.
- Data minimization (collect only what a feature uses); explicit informed consent before
  collecting; a user-facing way to export and delete all data.
- Encrypt sensitive data in transit and at rest. Do not log health data.
- The self-assessment is a SCREENER, never a diagnosis. Every result must end with a
  "see a clinician" referral and disclaimer.
- Fertility/ovulation prediction must show uncertainty for irregular cycles and must
  state it is NOT contraception.
- Flag for human review (do not silently implement): auth, encryption, consent flows,
  payments, anything touching the database schema or RLS policies.

## Workflow rules
- Use Plan Mode and show me the plan before implementing any non-trivial feature.
- Work in small, scoped tasks. Ask if a requirement is ambiguous instead of guessing.
- Build in vertical slices (DB → server logic → UI), one at a time.
- Before large changes, remind me to commit. Never run destructive DB commands.
- We build in 8 modules in order (see @docs/BUILD_PLAN.md). Stay within the current module.