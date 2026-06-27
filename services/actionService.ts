import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { getOpenActionItemsForReview } from "@/lib/action-items";
import type {
  ActionItem,
  ActionItemPriority,
  ActionItemStatus,
  ActionSuggestion,
} from "@/types";
import {
  findById,
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export interface CreateActionSuggestionInput {
  sessionId: string;
  participantId: string;
  text: string;
  sourceCardId?: string | null;
  sourceGroupId?: string | null;
}

export interface CreateActionItemInput {
  workspaceId: string;
  sourceSessionId: string;
  title: string;
  assignedToName: string;
  description?: string | null;
  assignedToUserId?: string | null;
  sourceCardId?: string | null;
  sourceGroupId?: string | null;
  dueDate?: string | null;
  priority?: ActionItemPriority;
  status?: ActionItemStatus;
}

export interface UpdateActionItemInput {
  title?: string;
  description?: string | null;
  assignedToName?: string;
  assignedToUserId?: string | null;
  dueDate?: string | null;
  priority?: ActionItemPriority;
  status?: ActionItemStatus;
  completedAt?: string | null;
  deletedAt?: string | null;
}

export const actionService = {
  listByWorkspace(workspaceId: string, includeDeleted = false): ActionItem[] {
    return getMockStore().actionItems.filter((item) => {
      if (item.workspaceId !== workspaceId) {
        return false;
      }
      return includeDeleted || item.deletedAt === null;
    });
  },

  listBySession(sessionId: string): ActionItem[] {
    return getMockStore().actionItems.filter(
      (item) => item.sourceSessionId === sessionId && item.deletedAt === null,
    );
  },

  listOpenForReview(workspaceId: string): ActionItem[] {
    return getOpenActionItemsForReview(actionService.listByWorkspace(workspaceId));
  },

  getById(actionItemId: string): ActionItem | null {
    return findById(getMockStore().actionItems, actionItemId) ?? null;
  },

  listSuggestionsBySession(sessionId: string): ActionSuggestion[] {
    return getMockStore().actionSuggestions.filter(
      (suggestion) =>
        suggestion.sessionId === sessionId && suggestion.deletedAt === null,
    );
  },

  createSuggestion(input: CreateActionSuggestionInput): ActionSuggestion {
    const suggestion: ActionSuggestion = {
      id: createId("suggestion"),
      sessionId: input.sessionId,
      participantId: input.participantId,
      text: input.text,
      sourceCardId: input.sourceCardId ?? null,
      sourceGroupId: input.sourceGroupId ?? null,
      convertedActionItemId: null,
      createdAt: nowIso(),
      deletedAt: null,
    };

    updateMockStore((state) => ({
      ...state,
      actionSuggestions: [...state.actionSuggestions, suggestion],
    }));

    return suggestion;
  },

  convertSuggestionToActionItem(
    suggestionId: string,
    overrides?: Partial<CreateActionItemInput>,
  ): ActionItem {
    const suggestion = findById(getMockStore().actionSuggestions, suggestionId);
    if (!suggestion) {
      throw notFoundError("ActionSuggestion", suggestionId);
    }

    const session = getMockStore().sessions.find(
      (item) => item.id === suggestion.sessionId,
    );
    if (!session) {
      throw notFoundError("Session", suggestion.sessionId);
    }

    const actionItem = actionService.create({
      workspaceId: session.workspaceId,
      sourceSessionId: suggestion.sessionId,
      title: overrides?.title ?? suggestion.text,
      assignedToName: overrides?.assignedToName ?? "Unassigned",
      description: overrides?.description ?? null,
      assignedToUserId: overrides?.assignedToUserId ?? null,
      sourceCardId: suggestion.sourceCardId,
      sourceGroupId: suggestion.sourceGroupId,
      dueDate: overrides?.dueDate ?? null,
      priority: overrides?.priority ?? "medium",
      status: overrides?.status ?? "to_do",
    });

    updateMockStore((state) => ({
      ...state,
      actionSuggestions: state.actionSuggestions.map((item) =>
        item.id === suggestionId
          ? { ...item, convertedActionItemId: actionItem.id }
          : item,
      ),
    }));

    return actionItem;
  },

  create(input: CreateActionItemInput): ActionItem {
    const createdAt = nowIso();
    const actionItem: ActionItem = {
      id: createId("action"),
      workspaceId: input.workspaceId,
      sourceSessionId: input.sourceSessionId,
      sourceCardId: input.sourceCardId ?? null,
      sourceGroupId: input.sourceGroupId ?? null,
      title: input.title,
      description: input.description ?? null,
      assignedToName: input.assignedToName,
      assignedToUserId: input.assignedToUserId ?? null,
      dueDate: input.dueDate ?? null,
      priority: input.priority ?? "medium",
      status: input.status ?? "to_do",
      createdAt,
      updatedAt: createdAt,
      completedAt: null,
      deletedAt: null,
    };

    updateMockStore((state) => ({
      ...state,
      actionItems: [...state.actionItems, actionItem],
    }));

    return actionItem;
  },

  update(actionItemId: string, input: UpdateActionItemInput): ActionItem {
    let updated: ActionItem | null = null;

    updateMockStore((state) => {
      const actionItems = state.actionItems.map((item) => {
        if (item.id !== actionItemId) {
          return item;
        }

        const nextStatus = input.status ?? item.status;
        const completedAt =
          input.completedAt !== undefined
            ? input.completedAt
            : nextStatus === "done" && !item.completedAt
              ? nowIso()
              : nextStatus !== "done"
                ? null
                : item.completedAt;

        updated = {
          ...item,
          ...input,
          status: nextStatus,
          completedAt,
          updatedAt: nowIso(),
        };
        return updated;
      });

      if (!updated) {
        throw notFoundError("ActionItem", actionItemId);
      }

      return { ...state, actionItems };
    });

    return updated!;
  },

  softDelete(actionItemId: string): ActionItem {
    return actionService.update(actionItemId, { deletedAt: nowIso() });
  },
};
