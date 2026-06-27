import { facilitatorProfile, mockProfiles } from "@/mock/profiles";
import { MOCK_IDS } from "@/mock/ids";
import { mockWorkspace, mockWorkspaceMembers } from "@/mock/workspace";
import { readFromStorage, writeToStorage } from "@/lib/storage";
import { actionBoardService } from "@/services/actionBoardService";
import { actionService } from "@/services/actionService";
import { cardService } from "@/services/cardService";
import { groupService } from "@/services/groupService";
import { participantService } from "@/services/participantService";
import { sessionService } from "@/services/sessionService";
import { getMockStore } from "@/services/store";
import { timerService } from "@/services/timerService";
import { voteService } from "@/services/voteService";
import { warmupService } from "@/services/warmupService";
import type {
  AuthContext,
  BackendClient,
  ParticipantContext,
  SessionSnapshot,
} from "@/services/backend/types";
import type { Profile } from "@/types";

const MOCK_AUTH_KEY = "mock-facilitator-auth-v1";

function getMockAuthUserId(): string | null {
  return readFromStorage<string | null>(MOCK_AUTH_KEY, null);
}

function setMockAuthUserId(userId: string | null): void {
  writeToStorage(MOCK_AUTH_KEY, userId);
}

function buildAuthContext(userId: string): AuthContext {
  const profile =
    mockProfiles.find((item) => item.id === userId) ?? facilitatorProfile;
  const member =
    mockWorkspaceMembers.find((item) => item.userId === userId) ??
    mockWorkspaceMembers[0];

  return {
    userId,
    profile,
    workspace: mockWorkspace,
    workspaceMember: member,
  };
}

async function resolveAuthContext(): Promise<AuthContext | null> {
  const userId = getMockAuthUserId();
  if (!userId) {
    return null;
  }
  return buildAuthContext(userId);
}

function resolveParticipant(ctx: ParticipantContext) {
  const participant = participantService.getByToken(ctx.participantToken);
  if (!participant || participant.id !== ctx.participantId) {
    throw new Error("Invalid participant credentials");
  }
  return participant;
}

export const mockBackend: BackendClient = {
  mode: "mock",

  getMockStore() {
    return getMockStore();
  },

  async getAuthContext() {
    return resolveAuthContext();
  },

  async signUp(email: string, _password: string, displayName: string) {
    const profile: Profile = {
      id: `mock-user-${Date.now()}`,
      displayName,
      email,
      createdAt: new Date().toISOString(),
    };
    setMockAuthUserId(profile.id);
    return {
      userId: profile.id,
      profile,
      workspace: mockWorkspace,
      workspaceMember: {
        id: "mock-member-new",
        workspaceId: MOCK_IDS.workspace,
        userId: profile.id,
        role: "owner",
        joinedAt: new Date().toISOString(),
      },
    };
  },

  async signIn(email: string, _password: string) {
    const profile =
      mockProfiles.find((item) => item.email === email) ?? facilitatorProfile;
    setMockAuthUserId(profile.id);
    return buildAuthContext(profile.id);
  },

  async signOut() {
    setMockAuthUserId(null);
  },

  async getProfile(userId: string) {
    return mockProfiles.find((item) => item.id === userId) ?? null;
  },

  async ensureAuthBootstrap(userId: string, email: string, displayName: string) {
    setMockAuthUserId(userId);
    return {
      userId,
      profile: {
        id: userId,
        displayName,
        email,
        createdAt: new Date().toISOString(),
      },
      workspace: mockWorkspace,
      workspaceMember: mockWorkspaceMembers[0],
    };
  },

  async listSessionsByWorkspace(workspaceId: string) {
    return sessionService.listByWorkspace(workspaceId);
  },

  async getSessionById(sessionId: string) {
    return sessionService.getById(sessionId);
  },

  async getSessionByCode(sessionCode: string) {
    return sessionService.getByCode(sessionCode);
  },

  async createSession(input) {
    return sessionService.create(input);
  },

  async updateSession(sessionId, input) {
    return sessionService.update(sessionId, input);
  },

  async advanceSessionPhase(sessionId, nextPhase) {
    return sessionService.advancePhase(sessionId, nextPhase);
  },

  async startSession(sessionId) {
    return sessionService.start(sessionId);
  },

  async completeSession(sessionId) {
    return sessionService.complete(sessionId);
  },

  async listParticipants(sessionId) {
    return participantService.listBySession(sessionId);
  },

  async joinSession(input) {
    return participantService.join(input);
  },

  async updateParticipantLastSeen(participantId, participantToken) {
    resolveParticipant({ participantId, participantToken, sessionId: "" });
    return participantService.updateLastSeen(participantId);
  },

  async getSessionSnapshot(sessionId): Promise<SessionSnapshot | null> {
    const session = sessionService.getById(sessionId);
    if (!session) {
      return null;
    }
    return {
      session,
      participants: participantService.listBySession(sessionId),
      warmupResponses: warmupService.listResponsesBySession(sessionId),
      cards: cardService.listBySession(sessionId),
      groups: groupService.listBySession(sessionId),
      groupingEvents: groupService.listEventsBySession(sessionId),
      votingSettings: voteService.getSettings(sessionId),
      votes: voteService.listBySession(sessionId),
      timers: timerService.listBySession(sessionId),
      actionSuggestions: actionService.listSuggestionsBySession(sessionId),
      actionItems: actionService.listBySession(sessionId),
    };
  },

  async listCards(sessionId) {
    return cardService.listBySession(sessionId);
  },

  async createCard(input, ctx) {
    resolveParticipant(ctx);
    return cardService.create(input);
  },

  async updateCard(cardId, input, ctx) {
    const card = cardService.getById(cardId);
    if (!card) {
      throw new Error("Card not found");
    }
    if ("participantToken" in ctx) {
      const participant = resolveParticipant(ctx);
      if (card.participantId !== participant.id) {
        throw new Error("Participants can only edit their own cards");
      }
      if (card.isRevealed) {
        throw new Error("Revealed cards are locked");
      }
    }
    return cardService.update(cardId, input);
  },

  async revealSessionCards(sessionId, _ctx) {
    return cardService.revealSessionCards(sessionId);
  },

  async deleteCard(cardId, ctx) {
    const participant = resolveParticipant(ctx);
    const card = cardService.getById(cardId);
    if (!card || card.participantId !== participant.id) {
      throw new Error("Participants can only delete their own cards");
    }
    if (card.isRevealed) {
      throw new Error("Revealed cards are locked");
    }
    return cardService.softDelete(cardId);
  },

  async listGroups(sessionId) {
    return groupService.listBySession(sessionId);
  },

  async createGroup(input, _actor) {
    return groupService.createGroup(input);
  },

  async updateGroupTitle(groupId, title, _actor) {
    return groupService.updateTitle(groupId, title);
  },

  async groupCards(input, _actor) {
    return groupService.groupCards(input);
  },

  async ungroupCards(sessionId, cardIds, _actor) {
    groupService.ungroupCards(sessionId, cardIds);
  },

  async deleteGroup(groupId, _actor) {
    return groupService.softDeleteGroup(groupId);
  },

  async undoLastGroupingEvent(sessionId, _actor) {
    return groupService.undoLastEvent(sessionId);
  },

  async listTimers(sessionId) {
    return timerService.listBySession(sessionId);
  },

  async upsertTimer(input, _ctx) {
    return timerService.upsert(input);
  },

  async startTimer(timerId, _ctx) {
    return timerService.start(timerId);
  },

  async pauseTimer(timerId, _ctx) {
    return timerService.pause(timerId);
  },

  async resumeTimer(timerId, _ctx) {
    return timerService.resume(timerId);
  },

  async endTimer(timerId, _ctx) {
    return timerService.end(timerId);
  },

  async getVotingSettings(sessionId) {
    return voteService.getSettings(sessionId);
  },

  async upsertVotingSettings(sessionId, input, _ctx) {
    return voteService.upsertSettings(sessionId, input);
  },

  async listVotes(sessionId) {
    return voteService.listBySession(sessionId);
  },

  async castVote(input, ctx) {
    resolveParticipant(ctx);
    return voteService.castVote(input);
  },

  async removeVote(voteId, ctx) {
    resolveParticipant(ctx);
    voteService.removeVote(voteId);
  },

  async listWarmupResponses(sessionId) {
    return warmupService.listResponsesBySession(sessionId);
  },

  async submitWarmupResponse(input, ctx) {
    resolveParticipant(ctx);
    return warmupService.submitResponse(input);
  },

  async listActionItemsByWorkspace(workspaceId) {
    return actionService.listByWorkspace(workspaceId);
  },

  async listActionSuggestions(sessionId) {
    return actionService.listSuggestionsBySession(sessionId);
  },

  async createActionSuggestion(input, ctx) {
    resolveParticipant(ctx);
    return actionService.createSuggestion(input);
  },

  async convertSuggestionToActionItem(suggestionId, overrides, _ctx) {
    return actionService.convertSuggestionToActionItem(suggestionId, overrides);
  },

  async createActionItem(input, _ctx) {
    return actionService.create(input);
  },

  async updateActionItem(actionItemId, input, _ctx) {
    return actionService.update(actionItemId, input);
  },

  async getActionBoardShareByWorkspace(workspaceId) {
    return actionBoardService.getByWorkspace(workspaceId);
  },

  async getActionBoardShareByToken(shareToken) {
    return actionBoardService.getByToken(shareToken);
  },

  async createActionBoardShare(workspaceId, _ctx) {
    return actionBoardService.create(workspaceId);
  },

  async regenerateActionBoardShare(shareId, _ctx) {
    return actionBoardService.regenerate(shareId);
  },

  async revokeActionBoardShare(shareId, _ctx) {
    return actionBoardService.revoke(shareId);
  },
};
