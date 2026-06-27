import type { Vote, VotingSettings } from "@/types";

export function getRemainingVotes(
  settings: VotingSettings,
  votes: Vote[],
  participantId: string,
): number {
  const usedVotes = votes.filter((vote) => vote.participantId === participantId).length;
  return Math.max(settings.votesPerParticipant - usedVotes, 0);
}

export function canVoteOnTarget(
  settings: VotingSettings,
  votes: Vote[],
  participantId: string,
  target: { targetType: Vote["targetType"]; targetCardId?: string | null; targetGroupId?: string | null },
): boolean {
  if (getRemainingVotes(settings, votes, participantId) <= 0) {
    return false;
  }

  if (settings.allowMultipleVotesPerTarget) {
    return true;
  }

  return !votes.some((vote) => {
    if (vote.participantId !== participantId) {
      return false;
    }
    if (target.targetType === "card") {
      return vote.targetType === "card" && vote.targetCardId === target.targetCardId;
    }
    return vote.targetType === "group" && vote.targetGroupId === target.targetGroupId;
  });
}

export function countVotesForCard(votes: Vote[], cardId: string): number {
  return votes.filter(
    (vote) => vote.targetType === "card" && vote.targetCardId === cardId,
  ).length;
}

export function countVotesForGroup(votes: Vote[], groupId: string): number {
  return votes.filter(
    (vote) => vote.targetType === "group" && vote.targetGroupId === groupId,
  ).length;
}

export function getVoteTotals(
  votes: Vote[],
): Map<string, { cardVotes: number; groupVotes: number }> {
  const totals = new Map<string, { cardVotes: number; groupVotes: number }>();

  for (const vote of votes) {
    const key =
      vote.targetType === "card"
        ? `card:${vote.targetCardId}`
        : `group:${vote.targetGroupId}`;
    const current = totals.get(key) ?? { cardVotes: 0, groupVotes: 0 };
    if (vote.targetType === "card") {
      current.cardVotes += 1;
    } else {
      current.groupVotes += 1;
    }
    totals.set(key, current);
  }

  return totals;
}
