import { daysAgo } from "@/lib/dates";
import type { CardGroup, GroupingEvent } from "@/types";
import { MOCK_IDS } from "@/mock/ids";

const sessionId = MOCK_IDS.session;
const createdAt = daysAgo(0);

export const mockCardGroups: CardGroup[] = [
  {
    id: MOCK_IDS.groups.planningClarity,
    sessionId,
    title: "Planning clarity",
    createdByParticipantId: MOCK_IDS.participants.alex,
    createdByUserId: MOCK_IDS.users.alex,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  },
  {
    id: MOCK_IDS.groups.releaseReadiness,
    sessionId,
    title: "Better release readiness",
    createdByParticipantId: MOCK_IDS.participants.alex,
    createdByUserId: MOCK_IDS.users.alex,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  },
];

export const mockGroupingEvents: GroupingEvent[] = [
  {
    id: "group-event-1",
    sessionId,
    actorParticipantId: MOCK_IDS.participants.alex,
    actorUserId: MOCK_IDS.users.alex,
    eventType: "group_created",
    payload: {
      groupId: MOCK_IDS.groups.planningClarity,
      groupTitle: "Planning clarity",
    },
    createdAt,
    undoneAt: null,
  },
  {
    id: "group-event-2",
    sessionId,
    actorParticipantId: MOCK_IDS.participants.alex,
    actorUserId: MOCK_IDS.users.alex,
    eventType: "cards_grouped",
    payload: {
      groupId: MOCK_IDS.groups.planningClarity,
      cardIds: ["card-12", "card-13"],
    },
    createdAt,
    undoneAt: null,
  },
  {
    id: "group-event-3",
    sessionId,
    actorParticipantId: MOCK_IDS.participants.alex,
    actorUserId: MOCK_IDS.users.alex,
    eventType: "group_created",
    payload: {
      groupId: MOCK_IDS.groups.releaseReadiness,
      groupTitle: "Better release readiness",
    },
    createdAt,
    undoneAt: null,
  },
  {
    id: "group-event-4",
    sessionId,
    actorParticipantId: MOCK_IDS.participants.alex,
    actorUserId: MOCK_IDS.users.alex,
    eventType: "cards_grouped",
    payload: {
      groupId: MOCK_IDS.groups.releaseReadiness,
      cardIds: ["card-14", "card-15"],
    },
    createdAt,
    undoneAt: null,
  },
];
