# Retroscope

## Product

**Name:** Retroscope  
**Tagline:** Look back. Move forward.

Retroscope is an all-in-one online retrospective workspace. Facilitators run structured retros for their teams; participants join with a code; insights become owned action items that live beyond the meeting.

## MVP Summary

The MVP delivers a complete retrospective flow in one product:

1. Facilitator creates a session and invites the team.
2. Optional warm-up breaks the ice.
3. Team reflects using a chosen retro framework.
4. Notes are grouped, voted on, and discussed.
5. Action items are captured during or after the retro.
6. A summary closes the loop and feeds the Action Items Board.

This foundation milestone sets up routing, layout, design tokens, folder structure, and placeholder pages only. No authentication, Supabase, or live session logic yet.

## Core User Flow

### Facilitator

1. Sign in (future).
2. Open the dashboard.
3. Create a new retro session.
4. Share a join code or link with participants.
5. Facilitate warm-up, reflection, grouping, voting, and discussion.
6. Capture action items and publish a session summary.
7. Track follow-through on the Action Items Board.

### Participant

1. Open the join link or enter a session code.
2. Enter a display name (and optionally pick an avatar later).
3. Join the live retro room.
4. Add notes, vote on themes, and contribute to discussion.
5. Review outcomes in the session summary (as shared by the facilitator).

## Warm-ups

Warm-ups help teams arrive present and engaged before the retro itself. Planned options include:

- One-word check-in
- Weather check
- Emoji mood board
- Quick drawing prompt
- Appreciation round

Facilitators can skip warm-ups or choose a preset before starting the session.

## Retro Frameworks

Retroscope supports common frameworks out of the box:

- **Start / Stop / Continue** — practical improvements and habits
- **Mad / Sad / Glad** — emotional tone and team morale
- **4Ls** — Liked, Learned, Lacked, Longed for
- **Custom templates** — facilitator-defined columns (future)

Framework choice sets the board layout for the reflection phase.

## Action Board Concept

The Action Items Board is a persistent workspace for commitments made during retros.

- Action items can include owner, due date, status, and source retro.
- Facilitators manage the board inside their workspace.
- A share link provides a read-only view for stakeholders.
- Future integrations may export items to Jira, Linear, Slack, or Teams.

The board closes the loop between reflection and follow-through.

## Future Features

- Lean Coffee
- Participant registration/login
- Workspace member invites and roles
- Jira/Linear export
- Slack/Teams sharing
- AI grouping
- AI retro summary
- AI action-item quality check
- Team health trends
- Custom templates
- Permanent participant avatars
- Advanced action board
- Exportable summaries
- Facilitator playbooks
