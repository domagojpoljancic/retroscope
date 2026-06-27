import { describe, expect, it, vi } from "vitest";

import { VotingPhase } from "@/components/session-room/phases/voting-phase";
import { renderInRoom } from "../helpers/room";
import { makeVote, makeVotingSettings } from "../factories";

// Voting actions hit the client API; we only care about the rendered counter.
vi.mock("@/lib/api", () => ({ api: {} }));

describe("VotingPhase remaining-vote counter", () => {
  it("shows the full allowance before any votes are cast", () => {
    const { container } = renderInRoom(<VotingPhase />, {
      store: { votingSettings: [makeVotingSettings({ votesPerParticipant: 3 })] },
    });
    expect(container.textContent).toContain("3 votes left");
  });

  it("decreases as the participant uses votes", () => {
    const { container } = renderInRoom(<VotingPhase />, {
      store: {
        votingSettings: [makeVotingSettings({ votesPerParticipant: 3 })],
        votes: [makeVote({ id: "v1", participantId: "participant-1" })],
      },
    });
    expect(container.textContent).toContain("2 votes left");
  });

  it("uses the singular form for a single remaining vote", () => {
    const { container } = renderInRoom(<VotingPhase />, {
      store: {
        votingSettings: [makeVotingSettings({ votesPerParticipant: 2 })],
        votes: [makeVote({ id: "v1", participantId: "participant-1" })],
      },
    });
    expect(container.textContent).toContain("1 vote left");
  });
});
