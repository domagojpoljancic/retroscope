import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { canVoteOnTarget } from "@/lib/voting";
import type { Vote, VoteTargetType, VotingSettings } from "@/types";
import { getMockStore, updateMockStore } from "@/services/store";

export interface CastVoteInput {
  sessionId: string;
  participantId: string;
  targetType: VoteTargetType;
  targetCardId?: string | null;
  targetGroupId?: string | null;
}

export interface UpdateVotingSettingsInput {
  votesPerParticipant?: number;
  allowMultipleVotesPerTarget?: boolean;
}

export const voteService = {
  getSettings(sessionId: string): VotingSettings | null {
    return (
      getMockStore().votingSettings.find(
        (settings) => settings.sessionId === sessionId,
      ) ?? null
    );
  },

  upsertSettings(
    sessionId: string,
    input: UpdateVotingSettingsInput,
  ): VotingSettings {
    const existing = voteService.getSettings(sessionId);
    const settings: VotingSettings = {
      sessionId,
      votesPerParticipant: input.votesPerParticipant ?? existing?.votesPerParticipant ?? 3,
      allowMultipleVotesPerTarget:
        input.allowMultipleVotesPerTarget ??
        existing?.allowMultipleVotesPerTarget ??
        false,
    };

    updateMockStore((state) => {
      const others = state.votingSettings.filter(
        (item) => item.sessionId !== sessionId,
      );
      return { ...state, votingSettings: [...others, settings] };
    });

    return settings;
  },

  listBySession(sessionId: string): Vote[] {
    return getMockStore().votes.filter((vote) => vote.sessionId === sessionId);
  },

  listByParticipant(sessionId: string, participantId: string): Vote[] {
    return voteService
      .listBySession(sessionId)
      .filter((vote) => vote.participantId === participantId);
  },

  castVote(input: CastVoteInput): Vote {
    const settings = voteService.getSettings(input.sessionId);
    if (!settings) {
      throw new Error("Voting settings not configured for session");
    }

    const votes = voteService.listBySession(input.sessionId);
    const canVote = canVoteOnTarget(settings, votes, input.participantId, {
      targetType: input.targetType,
      targetCardId: input.targetCardId,
      targetGroupId: input.targetGroupId,
    });

    if (!canVote) {
      throw new Error("Participant cannot vote on this target");
    }

    if (input.targetType === "card" && !input.targetCardId) {
      throw new Error("targetCardId is required for card votes");
    }

    if (input.targetType === "group" && !input.targetGroupId) {
      throw new Error("targetGroupId is required for group votes");
    }

    const vote: Vote = {
      id: createId("vote"),
      sessionId: input.sessionId,
      participantId: input.participantId,
      targetType: input.targetType,
      targetCardId: input.targetType === "card" ? input.targetCardId ?? null : null,
      targetGroupId: input.targetType === "group" ? input.targetGroupId ?? null : null,
      createdAt: nowIso(),
    };

    updateMockStore((state) => ({
      ...state,
      votes: [...state.votes, vote],
    }));

    return vote;
  },

  removeVote(voteId: string): void {
    updateMockStore((state) => ({
      ...state,
      votes: state.votes.filter((vote) => vote.id !== voteId),
    }));
  },

  clearSessionVotes(sessionId: string): void {
    updateMockStore((state) => ({
      ...state,
      votes: state.votes.filter((vote) => vote.sessionId !== sessionId),
    }));
  },
};
