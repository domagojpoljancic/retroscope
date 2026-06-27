import type { GroupingEventType } from "@/types/enums";

export interface CardGroup {
  id: string;
  sessionId: string;
  title: string;
  createdByParticipantId: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GroupingEventPayload {
  groupId?: string;
  groupTitle?: string;
  cardIds?: string[];
  sourceGroupIds?: string[];
  previousTitle?: string;
}

export interface GroupingEvent {
  id: string;
  sessionId: string;
  actorParticipantId: string | null;
  actorUserId: string | null;
  eventType: GroupingEventType;
  payload: GroupingEventPayload;
  createdAt: string;
  undoneAt: string | null;
}
