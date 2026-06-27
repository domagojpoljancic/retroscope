"use client";

import {
  advanceSessionPhaseAction,
  completeSessionAction,
  createSessionAction,
  getSessionByCodeAction,
  joinSessionAction,
  startSessionAction,
  updateSessionAction,
} from "@/app/actions/sessions";
import {
  castVoteAction,
  createActionBoardShareAction,
  createActionItemAction,
  createActionSuggestionAction,
  convertSuggestionAction,
  createCardAction,
  createGroupAction,
  deleteCardAction,
  deleteGroupAction,
  endTimerAction,
  extendTimerAction,
  getActionBoardShareByTokenAction,
  getActionBoardShareByWorkspaceAction,
  groupCardsAction,
  listActionItemsByWorkspaceAction,
  pauseTimerAction,
  regenerateActionBoardShareAction,
  removeVoteAction,
  resumeTimerAction,
  revealSessionCardsAction,
  revokeActionBoardShareAction,
  startTimerAction,
  submitWarmupResponseAction,
  undoGroupingEventAction,
  ungroupCardsAction,
  updateActionItemAction,
  updateCardAction,
  updateGroupTitleAction,
  upsertTimerAction,
  upsertVotingSettingsAction,
} from "@/app/actions/retro";
import { participantService } from "@/services/participantService";
import { sessionService } from "@/services/sessionService";
import { actionBoardService } from "@/services/actionBoardService";
import { actionService } from "@/services/actionService";
import { cardService } from "@/services/cardService";
import { groupService } from "@/services/groupService";
import { isSupabaseMode } from "@/lib/backend-mode";
import type { ParticipantContext } from "@/services/backend/types";
import { timerService } from "@/services/timerService";
import { voteService } from "@/services/voteService";
import { warmupService } from "@/services/warmupService";

async function unwrap<T>(result: { ok: boolean; data?: T; error?: string }): Promise<T> {
  if (!result.ok) {
    throw new Error(result.error ?? "Request failed");
  }
  return result.data as T;
}

/** Client API — uses server actions in Supabase mode, sync mock services otherwise. */
export const api = {
  isRemote: isSupabaseMode,

  async getSessionByCode(sessionCode: string) {
    if (isSupabaseMode()) {
      return unwrap(await getSessionByCodeAction(sessionCode));
    }
    return sessionService.getByCode(sessionCode);
  },

  async createSession(input: Parameters<typeof createSessionAction>[0]) {
    if (isSupabaseMode()) {
      return unwrap(await createSessionAction(input));
    }
    return sessionService.create(input);
  },

  async joinSession(input: Parameters<typeof joinSessionAction>[0]) {
    if (isSupabaseMode()) {
      return unwrap(await joinSessionAction(input));
    }
    return participantService.join(input);
  },

  async updateSession(...args: Parameters<typeof updateSessionAction>) {
    if (isSupabaseMode()) {
      return unwrap(await updateSessionAction(...args));
    }
    return sessionService.update(args[0], args[1]);
  },

  async advanceSessionPhase(...args: Parameters<typeof advanceSessionPhaseAction>) {
    if (isSupabaseMode()) {
      return unwrap(await advanceSessionPhaseAction(...args));
    }
    return sessionService.advancePhase(args[0], args[1]);
  },

  async startSession(sessionId: string) {
    if (isSupabaseMode()) {
      return unwrap(await startSessionAction(sessionId));
    }
    return sessionService.start(sessionId);
  },

  async completeSession(sessionId: string) {
    if (isSupabaseMode()) {
      return unwrap(await completeSessionAction(sessionId));
    }
    return sessionService.complete(sessionId);
  },

  async createCard(input: Parameters<typeof createCardAction>[0], ctx: ParticipantContext) {
    if (isSupabaseMode()) {
      return unwrap(await createCardAction(input, ctx));
    }
    return cardService.create(input);
  },

  async updateCard(
    cardId: string,
    input: Parameters<typeof updateCardAction>[1],
    ctx: Parameters<typeof updateCardAction>[2],
  ) {
    if (isSupabaseMode()) {
      return unwrap(await updateCardAction(cardId, input, ctx));
    }
    return cardService.update(cardId, input);
  },

  async deleteCard(cardId: string, ctx: ParticipantContext) {
    if (isSupabaseMode()) {
      return unwrap(await deleteCardAction(cardId, ctx));
    }
    return cardService.softDelete(cardId);
  },

  async revealSessionCards(sessionId: string) {
    if (isSupabaseMode()) {
      return unwrap(await revealSessionCardsAction(sessionId));
    }
    return cardService.revealSessionCards(sessionId);
  },

  async createGroup(input: Parameters<typeof createGroupAction>[0], actor: ParticipantContext | { userId: string }) {
    if (isSupabaseMode()) {
      return unwrap(await createGroupAction(input, actor));
    }
    return groupService.createGroup(input);
  },

  async castVote(input: Parameters<typeof castVoteAction>[0], ctx: ParticipantContext) {
    if (isSupabaseMode()) {
      return unwrap(await castVoteAction(input, ctx));
    }
    return voteService.castVote(input);
  },

  async removeVote(voteId: string, ctx: ParticipantContext) {
    if (isSupabaseMode()) {
      return unwrap(await removeVoteAction(voteId, ctx));
    }
    voteService.removeVote(voteId);
  },

  async submitWarmupResponse(input: Parameters<typeof submitWarmupResponseAction>[0], ctx: ParticipantContext) {
    if (isSupabaseMode()) {
      return unwrap(await submitWarmupResponseAction(input, ctx));
    }
    return warmupService.submitResponse(input);
  },

  async upsertVotingSettings(sessionId: string, input: Parameters<typeof upsertVotingSettingsAction>[1]) {
    if (isSupabaseMode()) {
      return unwrap(await upsertVotingSettingsAction(sessionId, input));
    }
    return voteService.upsertSettings(sessionId, input);
  },

  async upsertTimer(input: Parameters<typeof upsertTimerAction>[0]) {
    if (isSupabaseMode()) {
      return unwrap(await upsertTimerAction(input));
    }
    return timerService.upsert(input);
  },

  async startTimer(timerId: string) {
    if (isSupabaseMode()) {
      return unwrap(await startTimerAction(timerId));
    }
    return timerService.start(timerId);
  },

  async pauseTimer(timerId: string) {
    if (isSupabaseMode()) {
      return unwrap(await pauseTimerAction(timerId));
    }
    return timerService.pause(timerId);
  },

  async resumeTimer(timerId: string) {
    if (isSupabaseMode()) {
      return unwrap(await resumeTimerAction(timerId));
    }
    return timerService.resume(timerId);
  },

  async endTimer(timerId: string) {
    if (isSupabaseMode()) {
      return unwrap(await endTimerAction(timerId));
    }
    return timerService.end(timerId);
  },

  async extendTimer(timerId: string, extraSeconds: number) {
    if (isSupabaseMode()) {
      return unwrap(await extendTimerAction(timerId, extraSeconds));
    }
    return timerService.applyTransition(timerId, (current) => ({
      ...current,
      durationSeconds: current.durationSeconds + extraSeconds,
      endsAt: current.endsAt
        ? new Date(new Date(current.endsAt).getTime() + extraSeconds * 1000).toISOString()
        : current.endsAt,
    }));
  },

  async getActionBoardShareByToken(shareToken: string) {
    if (isSupabaseMode()) {
      return unwrap(await getActionBoardShareByTokenAction(shareToken));
    }
    return actionBoardService.getByToken(shareToken);
  },

  async listActionItemsByWorkspace(workspaceId: string) {
    if (isSupabaseMode()) {
      return unwrap(await listActionItemsByWorkspaceAction(workspaceId));
    }
    return actionService.listByWorkspace(workspaceId);
  },

  async getActionBoardShareByWorkspace(workspaceId: string) {
    if (isSupabaseMode()) {
      return unwrap(await getActionBoardShareByWorkspaceAction(workspaceId));
    }
    return actionBoardService.getByWorkspace(workspaceId);
  },

  async createActionBoardShare(workspaceId: string) {
    if (isSupabaseMode()) {
      return unwrap(await createActionBoardShareAction(workspaceId));
    }
    return actionBoardService.create(workspaceId);
  },

  async regenerateActionBoardShare(shareId: string) {
    if (isSupabaseMode()) {
      return unwrap(await regenerateActionBoardShareAction(shareId));
    }
    return actionBoardService.regenerate(shareId);
  },

  async revokeActionBoardShare(shareId: string) {
    if (isSupabaseMode()) {
      return unwrap(await revokeActionBoardShareAction(shareId));
    }
    return actionBoardService.revoke(shareId);
  },

  async updateActionItem(actionItemId: string, input: Parameters<typeof updateActionItemAction>[1]) {
    if (isSupabaseMode()) {
      return unwrap(await updateActionItemAction(actionItemId, input));
    }
    return actionService.update(actionItemId, input);
  },

  async createActionSuggestion(input: Parameters<typeof createActionSuggestionAction>[0], ctx: ParticipantContext) {
    if (isSupabaseMode()) {
      return unwrap(await createActionSuggestionAction(input, ctx));
    }
    return actionService.createSuggestion(input);
  },

  async undoGroupingEvent(sessionId: string) {
    if (isSupabaseMode()) {
      return unwrap(await undoGroupingEventAction(sessionId));
    }
    return groupService.undoLastEvent(sessionId);
  },

  async updateGroupTitle(groupId: string, title: string) {
    if (isSupabaseMode()) {
      return unwrap(await updateGroupTitleAction(groupId, title));
    }
    return groupService.updateTitle(groupId, title);
  },

  async deleteGroup(groupId: string) {
    if (isSupabaseMode()) {
      return unwrap(await deleteGroupAction(groupId));
    }
    return groupService.softDeleteGroup(groupId);
  },

  async groupCards(input: Parameters<typeof groupCardsAction>[0], actor: ParticipantContext | { userId: string }) {
    if (isSupabaseMode()) {
      return unwrap(await groupCardsAction(input, actor));
    }
    return groupService.groupCards(input);
  },

  async ungroupCards(
    sessionId: string,
    cardIds: string[],
    actor: ParticipantContext | { userId: string },
  ) {
    if (isSupabaseMode()) {
      return unwrap(await ungroupCardsAction(sessionId, cardIds, actor));
    }
    groupService.ungroupCards(sessionId, cardIds);
  },

  async convertSuggestionToActionItem(
    suggestionId: string,
    overrides?: Parameters<typeof actionService.convertSuggestionToActionItem>[1],
  ) {
    if (isSupabaseMode()) {
      return unwrap(await convertSuggestionAction(suggestionId, overrides));
    }
    return actionService.convertSuggestionToActionItem(suggestionId, overrides);
  },

  async createActionItem(input: Parameters<typeof actionService.create>[0]) {
    if (isSupabaseMode()) {
      return unwrap(await createActionItemAction(input));
    }
    return actionService.create(input);
  },

  async softDeleteActionItem(actionItemId: string) {
    if (isSupabaseMode()) {
      return unwrap(await updateActionItemAction(actionItemId, { deletedAt: new Date().toISOString() }));
    }
    return actionService.softDelete(actionItemId);
  },
};
