import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { CardGroup, GroupingEvent, GroupingEventPayload } from "@/types";
import {
  findById,
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export interface CreateGroupInput {
  sessionId: string;
  title: string;
  createdByParticipantId?: string | null;
  createdByUserId?: string | null;
}

export interface GroupCardsInput {
  sessionId: string;
  groupId: string;
  cardIds: string[];
  actorParticipantId?: string | null;
  actorUserId?: string | null;
}

export const groupService = {
  listBySession(sessionId: string, includeDeleted = false): CardGroup[] {
    return getMockStore().groups.filter((group) => {
      if (group.sessionId !== sessionId) {
        return false;
      }
      return includeDeleted || group.deletedAt === null;
    });
  },

  getById(groupId: string): CardGroup | null {
    return findById(getMockStore().groups, groupId) ?? null;
  },

  listEventsBySession(sessionId: string): GroupingEvent[] {
    return getMockStore()
      .groupingEvents.filter((event) => event.sessionId === sessionId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  getRecentUndoableEvent(sessionId: string): GroupingEvent | null {
    return (
      groupService
        .listEventsBySession(sessionId)
        .find((event) => event.undoneAt === null) ?? null
    );
  },

  createGroup(input: CreateGroupInput): CardGroup {
    const createdAt = nowIso();
    const group: CardGroup = {
      id: createId("group"),
      sessionId: input.sessionId,
      title: input.title,
      createdByParticipantId: input.createdByParticipantId ?? null,
      createdByUserId: input.createdByUserId ?? null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };

    updateMockStore((state) => ({
      ...state,
      groups: [...state.groups, group],
      groupingEvents: [
        ...state.groupingEvents,
        groupService.createEvent({
          sessionId: input.sessionId,
          eventType: "group_created",
          payload: { groupId: group.id, groupTitle: group.title },
          actorParticipantId: input.createdByParticipantId ?? null,
          actorUserId: input.createdByUserId ?? null,
        }),
      ],
    }));

    return group;
  },

  updateTitle(groupId: string, title: string): CardGroup {
    let updated: CardGroup | null = null;
    let previousTitle = "";

    updateMockStore((state) => {
      const groups = state.groups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        previousTitle = group.title;
        updated = { ...group, title, updatedAt: nowIso() };
        return updated;
      });

      if (!updated) {
        throw notFoundError("Group", groupId);
      }

      return {
        ...state,
        groups,
        groupingEvents: [
          ...state.groupingEvents,
          groupService.createEvent({
            sessionId: updated.sessionId,
            eventType: "group_title_updated",
            payload: { groupId, groupTitle: title, previousTitle },
          }),
        ],
      };
    });

    return updated!;
  },

  groupCards(input: GroupCardsInput): CardGroup {
    const group = groupService.getById(input.groupId);
    if (!group || group.sessionId !== input.sessionId) {
      throw notFoundError("Group", input.groupId);
    }

    updateMockStore((state) => ({
      ...state,
      cards: state.cards.map((card) =>
        input.cardIds.includes(card.id)
          ? { ...card, groupId: input.groupId, updatedAt: nowIso() }
          : card,
      ),
      groupingEvents: [
        ...state.groupingEvents,
        groupService.createEvent({
          sessionId: input.sessionId,
          eventType: "cards_grouped",
          payload: { groupId: input.groupId, cardIds: input.cardIds },
          actorParticipantId: input.actorParticipantId ?? null,
          actorUserId: input.actorUserId ?? null,
        }),
      ],
    }));

    return group;
  },

  ungroupCards(
    sessionId: string,
    cardIds: string[],
    actorParticipantId?: string | null,
    actorUserId?: string | null,
  ): void {
    updateMockStore((state) => ({
      ...state,
      cards: state.cards.map((card) =>
        cardIds.includes(card.id)
          ? { ...card, groupId: null, updatedAt: nowIso() }
          : card,
      ),
      groupingEvents: [
        ...state.groupingEvents,
        groupService.createEvent({
          sessionId,
          eventType: "cards_ungrouped",
          payload: { cardIds },
          actorParticipantId: actorParticipantId ?? null,
          actorUserId: actorUserId ?? null,
        }),
      ],
    }));
  },

  softDeleteGroup(groupId: string): CardGroup {
    let updated: CardGroup | null = null;

    updateMockStore((state) => {
      const groups = state.groups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        updated = { ...group, deletedAt: nowIso(), updatedAt: nowIso() };
        return updated;
      });

      if (!updated) {
        throw notFoundError("Group", groupId);
      }

      return {
        ...state,
        groups,
        cards: state.cards.map((card) =>
          card.groupId === groupId
            ? { ...card, groupId: null, updatedAt: nowIso() }
            : card,
        ),
        groupingEvents: [
          ...state.groupingEvents,
          groupService.createEvent({
            sessionId: updated.sessionId,
            eventType: "group_deleted",
            payload: { groupId },
          }),
        ],
      };
    });

    return updated!;
  },

  undoLastEvent(sessionId: string): GroupingEvent | null {
    const event = groupService.getRecentUndoableEvent(sessionId);
    if (!event) {
      return null;
    }

    const undoneAt = nowIso();

    updateMockStore((state) => {
      let cards = [...state.cards];
      let groups = [...state.groups];

      switch (event.eventType) {
        case "cards_grouped":
          cards = cards.map((card) =>
            event.payload.cardIds?.includes(card.id)
              ? { ...card, groupId: null, updatedAt: undoneAt }
              : card,
          );
          break;
        case "cards_ungrouped":
          // Cannot fully restore previous group membership without richer payload.
          break;
        case "group_created":
          groups = groups.map((group) =>
            group.id === event.payload.groupId
              ? { ...group, deletedAt: undoneAt, updatedAt: undoneAt }
              : group,
          );
          break;
        case "group_deleted":
          groups = groups.map((group) =>
            group.id === event.payload.groupId
              ? { ...group, deletedAt: null, updatedAt: undoneAt }
              : group,
          );
          break;
        case "group_title_updated":
          groups = groups.map((group) =>
            group.id === event.payload.groupId
              ? {
                  ...group,
                  title: event.payload.previousTitle ?? group.title,
                  updatedAt: undoneAt,
                }
              : group,
          );
          break;
        default:
          break;
      }

      return {
        ...state,
        cards,
        groups,
        groupingEvents: state.groupingEvents.map((item) =>
          item.id === event.id ? { ...item, undoneAt } : item,
        ),
      };
    });

    return { ...event, undoneAt };
  },

  createEvent(input: {
    sessionId: string;
    eventType: GroupingEvent["eventType"];
    payload: GroupingEventPayload;
    actorParticipantId?: string | null;
    actorUserId?: string | null;
  }): GroupingEvent {
    return {
      id: createId("group-event"),
      sessionId: input.sessionId,
      actorParticipantId: input.actorParticipantId ?? null,
      actorUserId: input.actorUserId ?? null,
      eventType: input.eventType,
      payload: input.payload,
      createdAt: nowIso(),
      undoneAt: null,
    };
  },
};
