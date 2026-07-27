# ycantyou Admin (testing)

Separate Next.js dashboard for **testing only**. Uses Supabase **service role on the server** — never expose `SUPABASE_SERVICE_ROLE_KEY` to the mobile app.

## Setup

1. Copy env template:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in from your Supabase project (Settings → API):

   - `NEXT_PUBLIC_SUPABASE_URL` — same as `EXPO_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — **server only**, never commit
   - `ADMIN_EMAILS` — comma-separated admin sign-in emails (must match Supabase Auth users)
   - `ADMIN_ALLOW_DESTRUCTIVE=true` — required for delete/wipe actions

3. Apply migrations (including feedback + admin audit):

   - `0011_user_feedback.sql`, `0012_feedback_feature_kind.sql`, `0017_admin_audit_log.sql`
   - Or run `npm run db:patch` from the repo root and paste into Supabase SQL Editor.

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) (Next default port).

From repo root: `npm run admin:dev`

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | Email/password sign-in (allowlisted only) |
| `/` | Counts overview |
| `/users` | Auth users + profile summary |
| `/users/[id]` | Detail + delete user |
| `/feedback` | Bug / feature / feedback inbox |
| `/reports` | Community moderation reports |
| `/danger` | Testing wipes (typed confirmation) |

## Security notes

- Non-allowlisted accounts are signed out immediately.
- Destructive tools require `ADMIN_ALLOW_DESTRUCTIVE=true` and typing `DELETE ALL TEST DATA`.
- Remove or lock down this app before production launch.
