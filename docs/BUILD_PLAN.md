# PCOS App — MVP Build Plan (8 Modules)

Build order is dependency-driven: each module relies on the ones before it. Build modules **1 → 4 first** and get one full user flow working end-to-end — that's your real MVP — then layer on 5–8.

---

## Locked stack
- **App:** React Native + Expo (Android-first), TypeScript (strict), Expo Router
- **Backend/DB:** Supabase — Postgres, Auth (phone/OTP + Google), Row-Level Security, Storage, Edge Functions (Deno/TS) for server logic
- **Data fetching:** TanStack Query · **Local state:** Zustand · **Forms:** react-hook-form + zod
- **Notifications:** Expo Notifications · **Analytics:** PostHog · **Errors:** Sentry
- **Build/CI:** EAS + GitHub Actions

**Deferred (Phase 1.5 / 2):** teleconsult booking + payments (1.5), partner section, wearables/Health Connect, video (2). Keep the data model aware they're coming, but build none of them now.

## Working rules (every module)
- Use **Plan Mode** in Claude Code; approve the plan before it writes code.
- Build **vertical slices** (DB → server logic → UI) so each piece is testable alone.
- **Commit after every module** (and before any large change). Work on branches.
- **Dev environment only** — a separate Supabase project with fake data; never real keys/users.
- Test on the **emulator for speed + a real low-end Android device** regularly.
- Flag for your own review: anything touching **auth, RLS, encryption, consent, payments**.

---

## Module 1 — Foundation & Scaffold
**Goal:** A running Expo app shell wired to Supabase, with tooling in place.
**Depends on:** nothing.

Build:
- `create-expo-app` (TS) + Expo Router; folder structure (`app/`, `features/`, `components/`, `lib/`, `hooks/`, `types/`).
- Supabase client (`lib/supabase.ts`), env via app config / Expo secrets (no secrets in git).
- Core deps installed; TanStack Query provider; Zustand store skeleton.
- Navigation shell: 5 tabs — Home, Track, Learn, Community, Profile (empty screens).
- Design tokens (colors/typography/spacing), base UI primitives.
- ESLint + Prettier + strict TS; Sentry + PostHog initialized; EAS project init.
- Drop in `CLAUDE.md`; create dev Supabase project.

**Done when:** app runs on emulator + real device, makes a successful test query to Supabase, and the tab shell navigates.

---

## Module 2 — Data Model + RLS (the backbone)
**Goal:** The full Postgres schema + security policies so every later feature has a home. *Get this right before any feature code — it's the most expensive thing to change later.*
**Depends on:** 1.

Tables (high level):
- `profiles` (1:1 with `auth.users`): name, dob, language, goal, onboarding_status
- `consents`: user_id, type, version, granted_at, revoked_at  *(versioned, for DPDP)*
- `cycles`: user_id, start_date, end_date, is_predicted, notes
- `daily_logs`: user_id, log_date (unique per user/day), flow_level, mood, energy, notes
- `symptoms` (lookup) + `daily_log_symptoms` (join, with severity)
- `screener_questions` (config) + `screener_responses` + `screener_results`
- `lab_results` (optional): test_type, value, unit, taken_on
- `content_categories` + `content_articles`: title, slug, body, language, published
- `community_posts` + `community_comments` + `community_reports`

Conventions: UUID PKs, `timestamptz`, `deleted_at` soft-delete (makes DPDP export/delete trivial). Indexes on `user_id`, dates, slugs.

RLS: user-owned tables → owner-only read/write; `content_*` → public read where `published`; community → read all, write own, report any.

**Done when:** migration runs clean, seed data loads, and RLS is verified (test user A cannot read user B's rows).
*(This is where the SQL migration artifact gets generated.)*

---

## Module 3 — Auth + Onboarding + Consent
**Goal:** Sign up/in and capture profile, goal, and explicit consent.
**Depends on:** 1, 2.

Build:
- Supabase Auth: phone/OTP (primary) + Google OAuth (providers + redirect config).
- Auth screens (phone entry, OTP verify, Google button); session handling; protected routing (unauth → auth).
- Onboarding wizard: name, DOB, primary goal (cycle / fertility / symptoms / weight / mood), language.
- Consent screen: explicit DPDP consent for health-data use, written + versioned to `consents`; link to privacy policy.
- Profile view/edit; logout; account-delete request (soft-delete + data-removal flow).

**Done when:** full sign-up → onboarding → home works on a real device with real OTP, consent is recorded, and protected routes hold. *(Review this code carefully — it's security-critical.)*

---

## Module 4 — Cycle / Period / Symptom Tracking (core loop)
**Goal:** The daily engagement loop. This is the heart of the app.
**Depends on:** 2, 3.

Build:
- Month calendar showing period days, today, and a clearly-labeled **estimated** fertile/next-period window.
- Log period start/end → `cycles`; daily log (flow, multi-select symptoms, mood, energy, notes) → `daily_logs` + `daily_log_symptoms`.
- Edit/delete with optimistic updates (TanStack Query); cycle history list.
- Reminders via Expo Notifications (predicted period / daily log nudge).
- **Honest prediction:** simple average-cycle estimate; explicitly show uncertainty for irregular cycles; permanent "not a contraceptive" note.

**Done when:** a user can log a full cycle + daily symptoms, see them on the calendar/history, and receive a reminder.

---

## Module 5 — Dashboard & Insights
**Goal:** Turn logged data into understanding.
**Depends on:** 4.

Build:
- Home dashboard: current cycle day/phase, next predicted period, recent symptoms, quick-log CTA.
- Insights: cycle-length trend, symptom patterns by phase (e.g., "acne clusters in your luteal phase"), simple charts.
- Do aggregations **server-side** (SQL views or an Edge Function), not on the client — keeps it fast and scalable.

**Done when:** the dashboard reflects real logged data and shows at least two meaningful insight cards.

---

## Module 6 — PCOS Risk Screener + Doctor Report
**Goal:** Your wedge feature — screen, score, refer, and produce a doctor-ready report.
**Depends on:** 2, 3 (richer with 4's data).

Build:
- Screener flow from your question set (the symptom checklist), weighted; responses → `screener_responses`.
- **Scoring server-side** (Edge Function) → `screener_results` with a risk band + referral threshold. *(Server-side so you can update the model without an app release.)*
- Result screen: risk indication + a clear **"this is not a diagnosis — see a clinician"** message + brief Rotterdam-criteria education.
- **Doctor Report PDF** (Edge Function): combines screener result + recent logs; downloadable/shareable.

**Done when:** complete the screener → see a scored result with a referral → generate and download a doctor report PDF.
*(Get the question weighting and content clinically reviewed before launch.)*

---

## Module 7 — Education / Content Hub
**Goal:** Myth-busting, vernacular content that drives retention (and later, SEO).
**Depends on:** 2.

Build:
- Category list → article reader (rich text/markdown from `content_articles`); search/filter; bookmarks.
- Language field structured for English first, then Malayalam/Hindi/Tamil.
- Authoring: a simple admin screen for now; plan a headless CMS (Sanity/Strapi) later so your clinical advisor can publish without deploys.

**Done when:** browse categories, read and bookmark articles, all served from Supabase.

---

## Module 8 — Community (lightweight) + Polish
**Goal:** Peer-support MVP plus the cross-cutting work needed to actually ship.
**Depends on:** 2, 3.

Community:
- Feed, create post, comment, like; topic tags.
- Safety: report/block, a basic moderation queue (`community_reports`), content rules, no medical-claim/misinfo content.

Polish (cross-cutting, ship-blockers):
- Settings + **privacy center: data export + delete** (DPDP).
- Notification preferences; i18n scaffolding.
- Empty/error/loading states; offline handling (TanStack Query persistence).
- PostHog events for your KPI funnel; Sentry verified.
- App icon, splash, store listing; green **EAS production Android build**.

**Done when:** community is usable + moderated, data export/delete works, analytics fire, and a production Android build succeeds.

---

## Suggested rhythm
1 → 2 → 3 → 4 (ship-able core), then 5 → 6 → 7 → 8. Demo-ready point: after **Module 4** you can show the core loop; after **Module 6** you have your differentiated story (screener + doctor report) for the meetup demo.