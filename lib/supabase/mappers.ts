import type {
  ActionBoardShare,
  ActionItem,
  ActionSuggestion,
  CardGroup,
  GroupingEvent,
  Participant,
  Profile,
  RetroCard,
  Session,
  TimerState,
  Vote,
  VotingSettings,
  WarmupResponse,
  Workspace,
  WorkspaceMember,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapProfile(row: Record<string, any>): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapWorkspace(row: Record<string, any>): Workspace {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function mapWorkspaceMember(row: Record<string, any>): WorkspaceMember {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

export function mapSession(row: Record<string, any>): Session {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    createdByUserId: row.created_by_user_id,
    name: row.name,
    sessionCode: row.session_code,
    warmupType: row.warmup_type,
    frameworkType: row.framework_type,
    anonymousCards: row.anonymous_cards,
    facilitatorParticipates: row.facilitator_participates,
    groupingPermission: row.grouping_permission,
    currentPhase: row.current_phase,
    status: row.status,
    createdAt: row.created_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

export function mapParticipant(
  row: Record<string, any>,
  participantToken?: string,
): Participant {
  return {
    id: row.id,
    sessionId: row.session_id,
    displayName: row.display_name,
    participantToken: participantToken ?? row.participant_token ?? "",
    userId: row.user_id,
    isFacilitatorParticipant: row.is_facilitator_participant,
    joinedAt: row.joined_at,
    lastSeenAt: row.last_seen_at,
  };
}

export function mapWarmupResponse(row: Record<string, any>): WarmupResponse {
  return {
    id: row.id,
    sessionId: row.session_id,
    participantId: row.participant_id,
    warmupType: row.warmup_type,
    response: row.response,
    createdAt: row.created_at,
  };
}

export function mapRetroCard(row: Record<string, any>): RetroCard {
  return {
    id: row.id,
    sessionId: row.session_id,
    participantId: row.participant_id,
    frameworkColumn: row.framework_column,
    text: row.text,
    isRevealed: row.is_revealed,
    revealedAt: row.revealed_at,
    groupId: row.group_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapCardGroup(row: Record<string, any>): CardGroup {
  return {
    id: row.id,
    sessionId: row.session_id,
    title: row.title,
    createdByParticipantId: row.created_by_participant_id,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapGroupingEvent(row: Record<string, any>): GroupingEvent {
  return {
    id: row.id,
    sessionId: row.session_id,
    actorParticipantId: row.actor_participant_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    payload: row.payload ?? {},
    createdAt: row.created_at,
    undoneAt: row.undone_at,
  };
}

export function mapTimerState(row: Record<string, any>): TimerState {
  return {
    id: row.id,
    sessionId: row.session_id,
    phase: row.phase,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    pausedAt: row.paused_at,
    endsAt: row.ends_at,
    status: row.status,
  };
}

export function mapVotingSettings(row: Record<string, any>): VotingSettings {
  return {
    sessionId: row.session_id,
    votesPerParticipant: row.votes_per_participant,
    allowMultipleVotesPerTarget: row.allow_multiple_votes_per_target,
  };
}

export function mapVote(row: Record<string, any>): Vote {
  return {
    id: row.id,
    sessionId: row.session_id,
    participantId: row.participant_id,
    targetType: row.target_type,
    targetCardId: row.target_card_id,
    targetGroupId: row.target_group_id,
    createdAt: row.created_at,
  };
}

export function mapActionSuggestion(row: Record<string, any>): ActionSuggestion {
  return {
    id: row.id,
    sessionId: row.session_id,
    participantId: row.participant_id,
    text: row.text,
    sourceCardId: row.source_card_id,
    sourceGroupId: row.source_group_id,
    convertedActionItemId: row.converted_action_item_id,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

export function mapActionItem(row: Record<string, any>): ActionItem {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    sourceSessionId: row.source_session_id,
    sourceCardId: row.source_card_id,
    sourceGroupId: row.source_group_id,
    title: row.title,
    description: row.description,
    assignedToName: row.assigned_to_name,
    assignedToUserId: row.assigned_to_user_id,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    deletedAt: row.deleted_at,
  };
}

export function mapActionBoardShare(
  row: Record<string, any>,
  shareToken?: string,
): ActionBoardShare {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    shareToken: shareToken ?? row.share_token ?? "",
    isActive: row.is_active,
    createdAt: row.created_at,
    regeneratedAt: row.regenerated_at,
    revokedAt: row.revoked_at,
  };
}
