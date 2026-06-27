import { countVotesForCard, countVotesForGroup } from "@/lib/voting";
import type { CardGroup, RetroCard, Vote } from "@/types";

export interface RankedTarget {
  id: string;
  type: "group" | "card";
  title: string;
  votes: number;
  group?: CardGroup;
  card?: RetroCard;
  /** Cards contained in a group target (empty for card targets). */
  cards: RetroCard[];
}

/**
 * Builds the ordered list of votable targets (groups + ungrouped revealed
 * cards) ranked by vote count. Cards inside groups are never standalone
 * targets.
 */
export function buildRankedTargets(
  cards: RetroCard[],
  groups: CardGroup[],
  votes: Vote[],
): RankedTarget[] {
  const liveCards = cards.filter((card) => card.deletedAt === null);

  const groupTargets: RankedTarget[] = groups.map((group) => {
    const groupCards = liveCards.filter((card) => card.groupId === group.id);
    return {
      id: group.id,
      type: "group" as const,
      title: group.title,
      votes: countVotesForGroup(votes, group.id),
      group,
      cards: groupCards,
    };
  });

  const ungroupedCardTargets: RankedTarget[] = liveCards
    .filter((card) => card.groupId === null && card.isRevealed)
    .map((card) => ({
      id: card.id,
      type: "card" as const,
      title: card.text,
      votes: countVotesForCard(votes, card.id),
      card,
      cards: [],
    }));

  return [...groupTargets, ...ungroupedCardTargets].sort(
    (a, b) => b.votes - a.votes,
  );
}
