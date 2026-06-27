import { describe, expect, it } from "vitest";

import {
  canVoteOnTarget,
  countVotesForCard,
  countVotesForGroup,
  getRemainingVotes,
  getVoteTotals,
} from "@/lib/voting";
import { makeVote, makeVotingSettings } from "../factories";

const settings = makeVotingSettings({ votesPerParticipant: 3 });

describe("getRemainingVotes", () => {
  it("returns the full allowance when no votes are cast", () => {
    expect(getRemainingVotes(settings, [], "p1")).toBe(3);
  });

  it("subtracts only the votes belonging to the participant", () => {
    const votes = [
      makeVote({ id: "v1", participantId: "p1" }),
      makeVote({ id: "v2", participantId: "p1" }),
      makeVote({ id: "v3", participantId: "p2" }),
    ];
    expect(getRemainingVotes(settings, votes, "p1")).toBe(1);
    expect(getRemainingVotes(settings, votes, "p2")).toBe(2);
  });

  it("never goes below zero even when over budget", () => {
    const votes = Array.from({ length: 5 }, (_, i) =>
      makeVote({ id: `v${i}`, participantId: "p1" }),
    );
    expect(getRemainingVotes(settings, votes, "p1")).toBe(0);
  });
});

describe("canVoteOnTarget", () => {
  const cardTarget = {
    targetType: "card" as const,
    targetCardId: "card-1",
    targetGroupId: null,
  };

  it("allows voting while votes remain", () => {
    expect(canVoteOnTarget(settings, [], "p1", cardTarget)).toBe(true);
  });

  it("blocks voting when no votes remain", () => {
    const votes = Array.from({ length: 3 }, (_, i) =>
      makeVote({ id: `v${i}`, participantId: "p1", targetCardId: `other-${i}` }),
    );
    expect(canVoteOnTarget(settings, votes, "p1", cardTarget)).toBe(false);
  });

  it("blocks a second vote on the same target by default", () => {
    const votes = [makeVote({ id: "v1", participantId: "p1", targetCardId: "card-1" })];
    expect(canVoteOnTarget(settings, votes, "p1", cardTarget)).toBe(false);
  });

  it("allows multiple votes on the same target when configured", () => {
    const multi = makeVotingSettings({ allowMultipleVotesPerTarget: true });
    const votes = [makeVote({ id: "v1", participantId: "p1", targetCardId: "card-1" })];
    expect(canVoteOnTarget(multi, votes, "p1", cardTarget)).toBe(true);
  });

  it("does not count another participant's vote against the target rule", () => {
    const votes = [makeVote({ id: "v1", participantId: "p2", targetCardId: "card-1" })];
    expect(canVoteOnTarget(settings, votes, "p1", cardTarget)).toBe(true);
  });

  it("treats group targets independently from card targets", () => {
    const groupTarget = {
      targetType: "group" as const,
      targetCardId: null,
      targetGroupId: "group-1",
    };
    const votes = [
      makeVote({
        id: "v1",
        participantId: "p1",
        targetType: "group",
        targetCardId: null,
        targetGroupId: "group-1",
      }),
    ];
    expect(canVoteOnTarget(settings, votes, "p1", groupTarget)).toBe(false);
    expect(canVoteOnTarget(settings, votes, "p1", cardTarget)).toBe(true);
  });
});

describe("vote tallies", () => {
  const votes = [
    makeVote({ id: "v1", targetType: "card", targetCardId: "card-1" }),
    makeVote({ id: "v2", targetType: "card", targetCardId: "card-1" }),
    makeVote({
      id: "v3",
      targetType: "group",
      targetCardId: null,
      targetGroupId: "group-1",
    }),
  ];

  it("counts votes for a card", () => {
    expect(countVotesForCard(votes, "card-1")).toBe(2);
    expect(countVotesForCard(votes, "card-2")).toBe(0);
  });

  it("counts votes for a group", () => {
    expect(countVotesForGroup(votes, "group-1")).toBe(1);
    expect(countVotesForGroup(votes, "group-2")).toBe(0);
  });

  it("aggregates totals keyed by target", () => {
    const totals = getVoteTotals(votes);
    expect(totals.get("card:card-1")?.cardVotes).toBe(2);
    expect(totals.get("group:group-1")?.groupVotes).toBe(1);
  });
});
