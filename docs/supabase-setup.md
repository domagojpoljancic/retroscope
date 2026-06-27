# Supabase setup

RetroScope supports two modes:

| Mode | When | Behavior |
|------|------|----------|
| **Mock / local** | Supabase env vars are missing | Data lives in `localStorage` via mock services (prototype mode) |
| **Supabase** | All required env vars are set | Auth, Postgres persistence, and Realtime |

## Environment variables

Copy `.env.example` to `.env.local` and fill in values from your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For Supabase mode | Public | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For Supabase mode | Public | Publishable key (preferred) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For Supabase mode | Public | Legacy alias for publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For server writes | **Server only** | Service role key for participant-token and share-token validation |

Without `SUPABASE_SERVICE_ROLE_KEY`, facilitator auth may work but participant join and share links will fall back to mock mode on the server.

## Database migrations

SQL migrations live in `supabase/migrations/`. Apply them with the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste the migration SQL into the Supabase SQL editor.

## Auth bootstrap

On first signup/login, a database trigger ensures:

1. A `profiles` row exists for the user
2. A default `workspaces` row is created
3. The user is added to `workspace_members` as `owner`

## Share tokens

Action board share tokens are hashed (SHA-256) before storage. The raw token is only returned once when created or regenerated. Revoked tokens set `is_active = false` and `revoked_at`.

## Realtime

When Supabase is configured, the session room subscribes to changes on:

- `sessions` (phase changes)
- `session_participants`
- `retro_cards`
- `votes`

Additional tables have subscription helpers in `lib/realtime/subscriptions.ts` for future expansion.

## Local development without Supabase

Simply omit all Supabase env vars and run:

```bash
npm run dev
```

The app uses the existing mock store and facilitator placeholder auth is replaced with a dev mock login.
