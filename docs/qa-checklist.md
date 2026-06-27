# RetroScope — Manual QA Checklist

A practical end-to-end checklist for manually verifying the MVP before a demo or
review. Most checks can be run in **mock mode** (no backend); items marked
_(Supabase)_ require a configured Supabase project.

## How to run

- **Mock mode:** `npm run dev` with no Supabase env vars set. Data persists in
  the browser's `localStorage`. To reset, clear site data / `localStorage`.
- **Supabase mode:** set the env vars from `.env.example`, apply the migration in
  `supabase/migrations/`, then `npm run dev`.
- Useful: open the same session in two browser windows (one as facilitator, one
  as a participant) to observe roles. In mock mode, the create flow also seeds a
  few demo participants.

Legend: ☐ = to verify.

---

## Landing & navigation

- ☐ Landing page (`/`) renders hero, value proposition, and primary call(s) to action.
- ☐ Landing CTAs route to the dashboard / create-session / join flows.
- ☐ Site header navigation works and the current route is reachable on refresh.
- ☐ Mobile-ish layout: at ~375–414px width the landing page has no overflow,
  buttons are tappable, and text wraps cleanly.

## Dashboard

- ☐ Dashboard (`/dashboard`) **empty state** shows guidance and a create-session action.
- ☐ Dashboard **populated state** lists existing sessions with status/metadata.
- ☐ Each session card links to the correct session room.

## Create session

- ☐ Create form (`/sessions/new`) validates a **missing name** (inline error, no submit).
- ☐ Selecting each warm-up (Mood Character / This or That / Guessing Game) works.
- ☐ Selecting each framework (Start/Stop/Continue, Mad/Sad/Glad, Sailboat) updates the column preview.
- ☐ Toggles: anonymous cards, facilitator participates, grouping permission.
- ☐ On success, a session code and shareable join link are shown and copyable.
- ☐ "Enter session room" navigates into the new session.

## Join session

- ☐ Join via link `/join/<code>` shows the session details and a name form.
- ☐ Join via code entry resolves the correct session.
- ☐ **Display name validation:** joining with an empty name shows an inline error.
- ☐ After joining, the participant lands in the live session room.
- ☐ "Welcome back" rejoin path appears when an identity is already stored, and
  "Join as someone else" clears it.

## Lobby

- ☐ Lobby lists joined participants and shows the facilitator/host.
- ☐ Facilitator can start / advance the session from the lobby.
- ☐ Participants see an appropriate waiting state until the session advances.

## Warm-ups

- ☐ **Mood Character Builder** renders and accepts a response.
- ☐ **This or That** renders prompts and records a choice.
- ☐ **Guessing Game** renders and accepts a response.
- ☐ Submitted warm-up responses are reflected back to the room.

## Previous action review

- ☐ When there are active prior action items, the **previous action review**
  phase appears and lists open items (sorted by priority).
- ☐ When there are no active prior items, this phase is **skipped** in the flow.

## Writing

- ☐ Writing timer displays and counts down; "+1 min", pause, and resume work.
- ☐ Pausing then resuming **preserves remaining time** (does not reset to full).
- ☐ Add a card — empty text shows an inline validation error.
- ☐ Owner can **edit** their own **unrevealed** card.
- ☐ Owner **cannot edit** a card once it is **revealed** (locked).
- ☐ Owner can **delete** their own unrevealed card (with confirm dialog).
- ☐ Owner can **reveal** their own card; "Reveal all my cards" works.
- ☐ Other participants' unrevealed cards appear obfuscated/hidden.
- ☐ Anonymous-cards setting hides author names when enabled.

## Facilitator reveal controls

- ☐ Facilitator can reveal an individual participant's unrevealed card.
- ☐ "Pending reveals by participant" shortcuts reveal that person's cards.
- ☐ "Reveal all cards" / "Reveal all in column" reveal as expected.
- ☐ A participant **cannot** reveal another participant's card.

## Reveal & group

- ☐ Only revealed cards can be selected for grouping.
- ☐ Enable grouping mode → select cards → "Create theme" creates a group.
- ☐ Add selected cards to an existing theme; remove a card from a theme.
- ☐ Rename a theme (validation rejects an empty title); delete a theme.

### Grouping permissions

- ☐ **Facilitator-only** session: participants cannot group (permission hint shown);
  facilitator can.
- ☐ **Participants-allowed** session: participants can create/edit groups.

### Grouping undo

- ☐ "Undo" reverts the most recent grouping action.
- ☐ Undo is disabled when there is nothing to undo.

## Voting setup

- ☐ Voting setup shows a suggested votes-per-participant and timer.
- ☐ Votes-per-participant validation rejects values ≤ 0.
- ☐ Settings persist into the voting phase.

## Voting

- ☐ Remaining-vote counter shows the full allowance initially.
- ☐ Casting a vote **decrements** the counter; removing a vote increments it.
- ☐ Without "allow multiple per target", a second vote on the same target is blocked.
- ☐ At zero remaining votes, the add control is disabled and a hint is shown.
- ☐ When voting ends (timer/facilitator), controls disable and an ended message shows.
- ☐ Vote totals per theme/card display correctly.

## Discussion & action suggestions

- ☐ Discussion phase surfaces top-voted themes/cards.
- ☐ Action suggestions can be added during discussion.
- ☐ A suggestion can be converted into an action item.

## Final action items

- ☐ Action items captured in the retro carry owner, due date, priority, status.
- ☐ Items are associated with the source session.

## Summary

- ☐ Summary phase / page (`/session/<id>/summary`) renders the retro outcome.
- ☐ Summary reflects themes, votes, and captured action items.

## Action board

- ☐ Action Items Board (`/actions`) lists items grouped by status columns.
- ☐ Search filters by title/owner/description.
- ☐ Owner, priority, and retro filters narrow the list; "no match" message shows when empty.
- ☐ Create, edit, and delete action items (with confirm) work.
- ☐ Overdue items are flagged.

## Shared read-only board

- ☐ "Share board" creates a link; copying works.
- ☐ Opening the share link `/actions/share/<token>` shows the board **read-only**.
- ☐ Read-only board shows the read-only banner and **no edit/create/share controls**.
- ☐ Cards on the read-only board are not clickable/editable.

## Links & access edge cases

- ☐ **Invalid join link** (malformed code) shows a clear "session not found" state.
- ☐ Unknown session code shows a not-found state with a way back home.
- ☐ Joining a **completed/archived** session is blocked with a helpful message.
- ☐ **Revoked share link:** after revoking (or regenerating), the old link shows
  "link unavailable"; a regenerated link works.

## Responsive / mobile-ish layout

- ☐ Session room top bar, phase content, and panels are usable at ~375–414px width.
- ☐ Board columns stack rather than overflow horizontally.
- ☐ Dialogs/modals are scrollable and dismissible on small screens.

## Backend modes

- ☐ Mock mode: full flow works with no env vars; data persists across reload via `localStorage`.
- ☐ _(Supabase)_ With env configured, auth, persistence, and realtime sync work,
  and share tokens are hashed before storage.
