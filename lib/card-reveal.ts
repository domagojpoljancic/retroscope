import { nowIso } from "@/lib/dates";
import { api } from "@/lib/api";
import { getParticipantContext } from "@/lib/participant-context";
import { cardService } from "@/services/cardService";
import { isSupabaseMode } from "@/lib/backend-mode";
import type { RetroCard } from "@/types";

export function revealCard(cardId: string, sessionId: string): void {
  const ctx = getParticipantContext(sessionId);
  if (isSupabaseMode() && ctx) {
    void api.updateCard(cardId, { isRevealed: true, revealedAt: nowIso() }, ctx);
    return;
  }
  cardService.update(cardId, { isRevealed: true, revealedAt: nowIso() });
}

export function revealCards(cards: RetroCard[], sessionId: string): void {
  for (const card of cards) {
    if (!card.isRevealed && card.deletedAt === null) {
      revealCard(card.id, sessionId);
    }
  }
}
