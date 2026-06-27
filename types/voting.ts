import type { VoteTargetType } from "@/types/enums";

export interface VotingSettings {
  sessionId: string;
  votesPerParticipant: number;
  allowMultipleVotesPerTarget: boolean;
}

export interface Vote {
  id: string;
  sessionId: string;
  participantId: string;
  targetType: VoteTargetType;
  targetCardId: string | null;
  targetGroupId: string | null;
  createdAt: string;
}
