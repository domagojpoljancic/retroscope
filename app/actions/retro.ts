"use server";

import { revalidatePath } from "next/cache";

import { getServerBackend } from "@/services/backend/client";
import type { ParticipantContext } from "@/services/backend/types";
import type { CreateCardInput, UpdateCardInput } from "@/services/cardService";
import type {
  CreateGroupInput,
  GroupCardsInput,
} from "@/services/groupService";
import type { CreateTimerInput } from "@/services/timerService";
import type {
  CastVoteInput,
  UpdateVotingSettingsInput,
} from "@/services/voteService";
import type { SubmitWarmupResponseInput } from "@/services/warmupService";
import type {
  CreateActionItemInput,
  CreateActionSuggestionInput,
  UpdateActionItemInput,
} from "@/services/actionService";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => ({
      ok: false as const,
      error: error instanceof Error ? error.message : "Something went wrong",
    }));
}

async function getFacilitatorContext() {
  const backend = getServerBackend();
  const auth = await backend.getAuthContext();
  if (!auth) {
    throw new Error("Facilitator authentication required");
  }
  return { backend, userId: auth.userId };
}

// Cards
export async function createCardAction(input: CreateCardInput, ctx: ParticipantContext) {
  return toResult(() => getServerBackend().createCard(input, ctx));
}

export async function updateCardAction(
  cardId: string,
  input: UpdateCardInput,
  ctx: ParticipantContext | { userId: string; isFacilitator: true },
) {
  return toResult(() => getServerBackend().updateCard(cardId, input, ctx));
}

export async function revealSessionCardsAction(sessionId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.revealSessionCards(sessionId, { userId });
  });
}

export async function deleteCardAction(cardId: string, ctx: ParticipantContext) {
  return toResult(() => getServerBackend().deleteCard(cardId, ctx));
}

// Groups
export async function createGroupAction(
  input: CreateGroupInput,
  actor: ParticipantContext | { userId: string },
) {
  return toResult(async () => {
    if ("participantToken" in actor) {
      return getServerBackend().createGroup(input, actor);
    }
    const { userId } = await getFacilitatorContext();
    return getServerBackend().createGroup(input, { userId });
  });
}

export async function updateGroupTitleAction(groupId: string, title: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.updateGroupTitle(groupId, title, { userId });
  });
}

export async function groupCardsAction(input: GroupCardsInput, actor: ParticipantContext | { userId: string }) {
  return toResult(async () => {
    if ("participantToken" in actor) {
      return getServerBackend().groupCards(input, actor);
    }
    const { userId } = await getFacilitatorContext();
    return getServerBackend().groupCards(input, { userId });
  });
}

export async function ungroupCardsAction(
  sessionId: string,
  cardIds: string[],
  actor: ParticipantContext | { userId: string },
) {
  return toResult(async () => {
    if ("participantToken" in actor) {
      return getServerBackend().ungroupCards(sessionId, cardIds, actor);
    }
    const { userId } = await getFacilitatorContext();
    return getServerBackend().ungroupCards(sessionId, cardIds, { userId });
  });
}

export async function deleteGroupAction(groupId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.deleteGroup(groupId, { userId });
  });
}

export async function undoGroupingEventAction(sessionId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.undoLastGroupingEvent(sessionId, { userId });
  });
}

// Timers
export async function upsertTimerAction(input: CreateTimerInput) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.upsertTimer(input, { userId });
  });
}

export async function startTimerAction(timerId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.startTimer(timerId, { userId });
  });
}

export async function pauseTimerAction(timerId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.pauseTimer(timerId, { userId });
  });
}

export async function resumeTimerAction(timerId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.resumeTimer(timerId, { userId });
  });
}

export async function endTimerAction(timerId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.endTimer(timerId, { userId });
  });
}

// Voting
export async function upsertVotingSettingsAction(sessionId: string, input: UpdateVotingSettingsInput) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.upsertVotingSettings(sessionId, input, { userId });
  });
}

export async function castVoteAction(input: CastVoteInput, ctx: ParticipantContext) {
  return toResult(() => getServerBackend().castVote(input, ctx));
}

export async function removeVoteAction(voteId: string, ctx: ParticipantContext) {
  return toResult(() => getServerBackend().removeVote(voteId, ctx));
}

// Warmup
export async function submitWarmupResponseAction(input: SubmitWarmupResponseInput, ctx: ParticipantContext) {
  return toResult(() => getServerBackend().submitWarmupResponse(input, ctx));
}

// Actions
export async function createActionSuggestionAction(
  input: CreateActionSuggestionInput,
  ctx: ParticipantContext,
) {
  return toResult(() => getServerBackend().createActionSuggestion(input, ctx));
}

export async function convertSuggestionAction(
  suggestionId: string,
  overrides?: Partial<CreateActionItemInput>,
) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.convertSuggestionToActionItem(suggestionId, overrides, { userId });
  });
}

export async function createActionItemAction(input: CreateActionItemInput) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    const item = await backend.createActionItem(input, { userId });
    revalidatePath("/actions");
    return item;
  });
}

export async function updateActionItemAction(actionItemId: string, input: UpdateActionItemInput) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    const item = await backend.updateActionItem(actionItemId, input, { userId });
    revalidatePath("/actions");
    return item;
  });
}

// Action board share
export async function getActionBoardShareByTokenAction(shareToken: string) {
  return toResult(() => getServerBackend().getActionBoardShareByToken(shareToken));
}

export async function getActionBoardShareByWorkspaceAction(workspaceId: string) {
  return toResult(() => getServerBackend().getActionBoardShareByWorkspace(workspaceId));
}

export async function createActionBoardShareAction(workspaceId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.createActionBoardShare(workspaceId, { userId });
  });
}

export async function regenerateActionBoardShareAction(shareId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.regenerateActionBoardShare(shareId, { userId });
  });
}

export async function revokeActionBoardShareAction(shareId: string) {
  return toResult(async () => {
    const { backend, userId } = await getFacilitatorContext();
    return backend.revokeActionBoardShare(shareId, { userId });
  });
}

export async function listActionItemsByWorkspaceAction(workspaceId: string) {
  return toResult(() => getServerBackend().listActionItemsByWorkspace(workspaceId));
}

export async function extendTimerAction(timerId: string, extraSeconds: number) {
  return toResult(async () => {
    const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
    const { mapTimerState } = await import("@/lib/supabase/mappers");
    const db = createSupabaseAdminClient();
    const { data: existing } = await db.from("session_timers").select("*").eq("id", timerId).maybeSingle();
    if (!existing) {
      throw new Error("Timer not found");
    }
    const { data, error } = await db
      .from("session_timers")
      .update({
        duration_seconds: existing.duration_seconds + extraSeconds,
        ends_at: existing.ends_at
          ? new Date(new Date(existing.ends_at).getTime() + extraSeconds * 1000).toISOString()
          : existing.ends_at,
      })
      .eq("id", timerId)
      .select("*")
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return mapTimerState(data);
  });
}
