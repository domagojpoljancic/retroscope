import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { sessionService } from "@/services/sessionService";
import type { RetroCard } from "@/types";
import {
  findById,
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export interface CreateCardInput {
  sessionId: string;
  participantId: string;
  frameworkColumn: string;
  text: string;
}

export interface UpdateCardInput {
  text?: string;
  frameworkColumn?: string;
  groupId?: string | null;
  isRevealed?: boolean;
  revealedAt?: string | null;
  deletedAt?: string | null;
}

export const cardService = {
  listBySession(sessionId: string, includeDeleted = false): RetroCard[] {
    return getMockStore().cards.filter((card) => {
      if (card.sessionId !== sessionId) {
        return false;
      }
      return includeDeleted || card.deletedAt === null;
    });
  },

  listByColumn(sessionId: string, frameworkColumn: string): RetroCard[] {
    return cardService
      .listBySession(sessionId)
      .filter((card) => card.frameworkColumn === frameworkColumn);
  },

  getById(cardId: string): RetroCard | null {
    return findById(getMockStore().cards, cardId) ?? null;
  },

  create(input: CreateCardInput): RetroCard {
    if (!sessionService.validateFrameworkColumn(input.sessionId, input.frameworkColumn)) {
      throw new Error(`Invalid framework column: ${input.frameworkColumn}`);
    }

    const createdAt = nowIso();
    const card: RetroCard = {
      id: createId("card"),
      sessionId: input.sessionId,
      participantId: input.participantId,
      frameworkColumn: input.frameworkColumn,
      text: input.text,
      isRevealed: false,
      revealedAt: null,
      groupId: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };

    updateMockStore((state) => ({
      ...state,
      cards: [...state.cards, card],
    }));

    return card;
  },

  update(cardId: string, input: UpdateCardInput): RetroCard {
    let updated: RetroCard | null = null;

    updateMockStore((state) => {
      const cards = state.cards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }

        if (
          input.frameworkColumn &&
          !sessionService.validateFrameworkColumn(card.sessionId, input.frameworkColumn)
        ) {
          throw new Error(`Invalid framework column: ${input.frameworkColumn}`);
        }

        updated = {
          ...card,
          ...input,
          updatedAt: nowIso(),
        };
        return updated;
      });

      if (!updated) {
        throw notFoundError("Card", cardId);
      }

      return { ...state, cards };
    });

    return updated!;
  },

  revealSessionCards(sessionId: string): RetroCard[] {
    const revealedAt = nowIso();
    updateMockStore((state) => ({
      ...state,
      cards: state.cards.map((card) =>
        card.sessionId === sessionId && card.deletedAt === null
          ? { ...card, isRevealed: true, revealedAt, updatedAt: revealedAt }
          : card,
      ),
    }));

    return cardService.listBySession(sessionId);
  },

  softDelete(cardId: string): RetroCard {
    return cardService.update(cardId, { deletedAt: nowIso() });
  },
};
