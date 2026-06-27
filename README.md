# RetroScope

> Look back. Move forward.

RetroScope is an all-in-one online retrospective workspace. Facilitators run structured retros for their teams, participants join with a simple code, and the insights that come up turn into owned action items that live on beyond the meeting.

## The problem it solves

Most team retrospectives happen in a generic whiteboard or doc, and the good intentions captured there are forgotten by the next sprint. RetroScope gives teams a purpose-built, guided retro flow — from warm-up to voting to follow-through — and keeps the resulting action items in one place so commitments don't get lost.

## Project status

**Early MVP.** The full retrospective flow is implemented and runnable end to end. The app ships with a built-in **local mock mode** (no backend required) so you can try the entire flow immediately, and an optional **Supabase mode** for real authentication, persistence, and realtime sync.

This is an early-stage project. Expect rough edges, and see [Known limitations](#known-limitations) before relying on it for production retros.

## Current features

- **Guided session phases** — Lobby → Warm-up → Previous action review → Writing → Reveal & Group → Voting → Discussion → Summary.
- **Facilitator dashboard** — create sessions, share a join code/link, and run the session through each phase.
- **Participant join flow** — join by session code or link and take part with a display name.
- **Retro frameworks** — Start/Stop/Continue, Mad/Sad/Glad, and Sailboat board layouts.
- **Warm-up activities** — Mood Character Builder, This or That, and Guessing Game to open the session.
- **Card writing, grouping, and reveal** — participants add notes that are revealed and organized into themes.
- **Voting** — configurable voting on grouped themes to surface what matters most.
- **Action items & Action Board** — capture commitments during the retro and review them on a persistent board.
- **Session summary** — closes the loop at the end of the retro.
- **Read-only share links** — share an action board view via a tokenized link (tokens are hashed before storage in Supabase mode).
- **Realtime updates** — live session sync when Supabase is configured.
- **Dual backend** — runs fully in-browser with `localStorage` mock data, or against Supabase when configured.

## Main user flow

**Facilitator**

1. Open the dashboard and create a new retro session.
2. Share the generated join code or link with the team.
3. Move the session through warm-up, writing, grouping, voting, and discussion.
4. Capture action items and publish a summary.
5. Track follow-through on the Action Board.

**Participant**

1. Open the join link or enter the session code.
2. Enter a display name to join the live room.
3. Add notes, vote on themes, and join the discussion.
4. Review outcomes in the shared summary.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19
- TypeScript
- Tailwind CSS v4
- Server Actions for backend operations
- [Supabase](https://supabase.com) (Postgres, Auth, Realtime) — optional
- [shadcn/ui](https://ui.shadcn.com)-style components with Radix primitives and `lucide-react`

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run locally (mock mode)

No backend or environment variables are required. RetroScope automatically runs in local mock mode when Supabase env vars are absent, storing data in the browser's `localStorage`.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Supabase (optional)

1. Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

2. Apply the database schema in `supabase/migrations/` — either with the Supabase CLI (`supabase db push`) or by pasting the SQL into the Supabase SQL editor. See [`docs/supabase-setup.md`](docs/supabase-setup.md) for details.

3. Start the dev server:

   ```bash
   npm run dev
   ```

When the required env vars are present, RetroScope switches to Supabase mode with real auth, persistence, and realtime.

### Environment variables

Use placeholders only — never commit real keys. See `.env.example`.

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase mode only | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase mode only | Public | Supabase publishable key. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted as a fallback. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes | **Server only** | Service role key for participant-token and share-token server actions. Never expose to the client. |

If all are unset, the app runs in mock mode.

## Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check the project with `tsc` |
| `npm run test` | Run the test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Testing

RetroScope uses [Vitest](https://vitest.dev) with
[Testing Library](https://testing-library.com) and `jsdom`.

```bash
npm run test
```

Tests live in `tests/`:

- `tests/unit/` — pure utility logic: framework columns, voting limits and
  remaining-vote calculation, timer math, action-item filters, and card
  permissions.
- `tests/components/` — focused component behavior: Create Session and
  Participant Join form validation, Action Board filtering, the read-only
  shared board, the session phase header, and the voting counter.

Shared test fixtures and helpers are in `tests/factories.ts` and
`tests/helpers/`.

## Known limitations

- This is an early MVP; the flow works but has not been hardened for production use.
- Mock mode data lives only in the browser's `localStorage` and is not shared between devices or persisted server-side.
- Authentication and full persistence require a configured Supabase project.
- Automated tests cover core utilities and key form/permission UI; broader end-to-end coverage is not yet in place (see the [manual QA checklist](docs/qa-checklist.md)).
- Custom retro templates and additional warm-up activities are planned but not fully built out.

## Planned improvements

- Lean Coffee mode
- Participant registration and workspace member roles
- Jira / Linear export and Slack / Teams sharing
- AI-assisted grouping, summaries, and action-item quality checks
- Team health trends and exportable summaries
- Custom retro templates and facilitator playbooks

## License

No license has been specified yet. All rights reserved by the author until a license is added.
