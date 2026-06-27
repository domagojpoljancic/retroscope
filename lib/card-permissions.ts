import type { RetroCard, Session } from "@/types";

/** Minimal viewer shape needed to evaluate card permissions. */
export interface CardViewer {
  participantId: string | null;
  isFacilitator: boolean;
}

export function isCardOwner(card: RetroCard, viewer: CardViewer): boolean {
  return viewer.participantId !== null && card.participantId === viewer.participantId;
}

/** Owners may only edit their own cards while they are still unrevealed. */
export function canEditCard(card: RetroCard, viewer: CardViewer): boolean {
  return isCardOwner(card, viewer) && !card.isRevealed;
}

/** Deleting follows the same rule as editing: owner-only, unrevealed-only. */
export function canDeleteCard(card: RetroCard, viewer: CardViewer): boolean {
  return isCardOwner(card, viewer) && !card.isRevealed;
}

/**
 * A card can be revealed by its owner or by the facilitator. Participants can
 * never reveal someone else's card, and already-revealed cards cannot be
 * revealed again.
 */
export function canRevealCard(card: RetroCard, viewer: CardViewer): boolean {
  if (card.isRevealed) {
    return false;
  }
  return isCardOwner(card, viewer) || viewer.isFacilitator;
}

/**
 * Grouping is always available to the facilitator, and to participants only
 * when the session explicitly allows it.
 */
export function canGroupCards(
  session: Pick<Session, "groupingPermission">,
  viewer: CardViewer,
): boolean {
  return viewer.isFacilitator || session.groupingPermission === "participants_allowed";
}
