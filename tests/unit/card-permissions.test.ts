import { describe, expect, it } from "vitest";

import {
  canDeleteCard,
  canEditCard,
  canGroupCards,
  canRevealCard,
  isCardOwner,
  type CardViewer,
} from "@/lib/card-permissions";
import { makeCard, makeSession } from "../factories";

const owner: CardViewer = { participantId: "participant-1", isFacilitator: false };
const otherParticipant: CardViewer = {
  participantId: "participant-2",
  isFacilitator: false,
};
const facilitator: CardViewer = { participantId: "facilitator-1", isFacilitator: true };
const spectator: CardViewer = { participantId: null, isFacilitator: false };

describe("isCardOwner", () => {
  it("matches the authoring participant", () => {
    expect(isCardOwner(makeCard(), owner)).toBe(true);
    expect(isCardOwner(makeCard(), otherParticipant)).toBe(false);
  });

  it("is never true for a viewer without a participant id", () => {
    expect(isCardOwner(makeCard(), spectator)).toBe(false);
  });
});

describe("canEditCard", () => {
  it("lets the owner edit their own unrevealed card", () => {
    expect(canEditCard(makeCard({ isRevealed: false }), owner)).toBe(true);
  });

  it("prevents the owner from editing a revealed card", () => {
    expect(canEditCard(makeCard({ isRevealed: true }), owner)).toBe(false);
  });

  it("prevents other participants and facilitators from editing someone else's card", () => {
    const card = makeCard({ isRevealed: false });
    expect(canEditCard(card, otherParticipant)).toBe(false);
    expect(canEditCard(card, facilitator)).toBe(false);
  });
});

describe("canDeleteCard", () => {
  it("follows the same owner-only, unrevealed-only rule as editing", () => {
    expect(canDeleteCard(makeCard({ isRevealed: false }), owner)).toBe(true);
    expect(canDeleteCard(makeCard({ isRevealed: true }), owner)).toBe(false);
    expect(canDeleteCard(makeCard(), otherParticipant)).toBe(false);
  });
});

describe("canRevealCard", () => {
  it("lets the owner reveal their own card", () => {
    expect(canRevealCard(makeCard({ isRevealed: false }), owner)).toBe(true);
  });

  it("lets the facilitator reveal any unrevealed card", () => {
    expect(canRevealCard(makeCard({ isRevealed: false }), facilitator)).toBe(true);
  });

  it("does not let a participant reveal another participant's card", () => {
    expect(canRevealCard(makeCard({ isRevealed: false }), otherParticipant)).toBe(false);
  });

  it("never reveals an already-revealed card", () => {
    expect(canRevealCard(makeCard({ isRevealed: true }), owner)).toBe(false);
    expect(canRevealCard(makeCard({ isRevealed: true }), facilitator)).toBe(false);
  });
});

describe("canGroupCards", () => {
  it("always allows the facilitator", () => {
    const session = makeSession({ groupingPermission: "facilitator_only" });
    expect(canGroupCards(session, facilitator)).toBe(true);
  });

  it("blocks participants when grouping is facilitator-only", () => {
    const session = makeSession({ groupingPermission: "facilitator_only" });
    expect(canGroupCards(session, owner)).toBe(false);
  });

  it("allows participants when the session permits it", () => {
    const session = makeSession({ groupingPermission: "participants_allowed" });
    expect(canGroupCards(session, owner)).toBe(true);
  });
});
