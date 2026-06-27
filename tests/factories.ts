import type {
  ActionItem,
  Participant,
  RetroCard,
  Session,
  TimerState,
  Vote,
  VotingSettings,
} from "@/types";

/**
 * Lightweight factories for building domain objects in tests. Every field has a
 * sensible default; pass overrides for the bits that matter to a given test.
 */

export function makeCard(overrides: Partial<RetroCard> = {}): RetroCard {
  return {
    id: "card-1",
    sessionId: "session-1",
    participantId: "participant-1",
    frameworkColumn: "start",
    text: "Sample card",
    isRevealed: false,
    revealedAt: null,
    groupId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

export function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "session-1",
    workspaceId: "workspace-1",
    createdByUserId: "user-1",
    name: "Sprint Retro",
    sessionCode: "ABC123",
    warmupType: "mood_character",
    frameworkType: "start_stop_continue",
    anonymousCards: true,
    facilitatorParticipates: true,
    groupingPermission: "facilitator_only",
    currentPhase: "lobby",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    startedAt: null,
    endedAt: null,
    ...overrides,
  };
}

export function makeVote(overrides: Partial<Vote> = {}): Vote {
  return {
    id: "vote-1",
    sessionId: "session-1",
    participantId: "participant-1",
    targetType: "card",
    targetCardId: "card-1",
    targetGroupId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeVotingSettings(
  overrides: Partial<VotingSettings> = {},
): VotingSettings {
  return {
    sessionId: "session-1",
    votesPerParticipant: 3,
    allowMultipleVotesPerTarget: false,
    ...overrides,
  };
}

export function makeTimer(overrides: Partial<TimerState> = {}): TimerState {
  return {
    id: "timer-1",
    sessionId: "session-1",
    phase: "writing",
    durationSeconds: 300,
    startedAt: null,
    pausedAt: null,
    endsAt: null,
    status: "not_started",
    ...overrides,
  };
}

export function makeParticipant(
  overrides: Partial<Participant> = {},
): Participant {
  return {
    id: "participant-1",
    sessionId: "session-1",
    displayName: "Jordan",
    participantToken: "token-1",
    userId: null,
    isFacilitatorParticipant: false,
    joinedAt: "2024-01-01T00:00:00.000Z",
    lastSeenAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeActionItem(overrides: Partial<ActionItem> = {}): ActionItem {
  return {
    id: "action-1",
    workspaceId: "workspace-1",
    sourceSessionId: "session-1",
    sourceCardId: null,
    sourceGroupId: null,
    title: "Follow up on deploys",
    description: null,
    assignedToName: "Alex",
    assignedToUserId: null,
    dueDate: null,
    priority: "medium",
    status: "to_do",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    completedAt: null,
    deletedAt: null,
    ...overrides,
  };
}
