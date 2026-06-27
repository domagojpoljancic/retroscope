import type { ActionItemPriority, ActionItemStatus } from "@/types/enums";

export interface ActionSuggestion {
  id: string;
  sessionId: string;
  participantId: string;
  text: string;
  sourceCardId: string | null;
  sourceGroupId: string | null;
  convertedActionItemId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface ActionItem {
  id: string;
  workspaceId: string;
  sourceSessionId: string;
  sourceCardId: string | null;
  sourceGroupId: string | null;
  title: string;
  description: string | null;
  assignedToName: string;
  assignedToUserId: string | null;
  dueDate: string | null;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
}

export interface ActionBoardShare {
  id: string;
  workspaceId: string;
  shareToken: string;
  isActive: boolean;
  createdAt: string;
  regeneratedAt: string | null;
  revokedAt: string | null;
}
