import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { ActionBoardShare } from "@/types";
import {
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export const actionBoardService = {
  getByWorkspace(workspaceId: string): ActionBoardShare | null {
    return (
      getMockStore().actionBoardShares.find(
        (share) => share.workspaceId === workspaceId && share.isActive,
      ) ?? null
    );
  },

  getByToken(shareToken: string): ActionBoardShare | null {
    return (
      getMockStore().actionBoardShares.find(
        (share) =>
          share.shareToken === shareToken &&
          share.isActive &&
          share.revokedAt === null,
      ) ?? null
    );
  },

  create(workspaceId: string): ActionBoardShare {
    const share: ActionBoardShare = {
      id: createId("action-board-share"),
      workspaceId,
      shareToken: createId("share"),
      isActive: true,
      createdAt: nowIso(),
      regeneratedAt: null,
      revokedAt: null,
    };

    updateMockStore((state) => ({
      ...state,
      actionBoardShares: [...state.actionBoardShares, share],
    }));

    return share;
  },

  regenerate(shareId: string): ActionBoardShare {
    let updated: ActionBoardShare | null = null;

    updateMockStore((state) => {
      const actionBoardShares = state.actionBoardShares.map((share) => {
        if (share.id !== shareId) {
          return share;
        }
        updated = {
          ...share,
          shareToken: createId("share"),
          regeneratedAt: nowIso(),
          isActive: true,
          revokedAt: null,
        };
        return updated;
      });

      if (!updated) {
        throw notFoundError("ActionBoardShare", shareId);
      }

      return { ...state, actionBoardShares };
    });

    return updated!;
  },

  revoke(shareId: string): ActionBoardShare {
    let updated: ActionBoardShare | null = null;

    updateMockStore((state) => {
      const actionBoardShares = state.actionBoardShares.map((share) => {
        if (share.id !== shareId) {
          return share;
        }
        updated = {
          ...share,
          isActive: false,
          revokedAt: nowIso(),
        };
        return updated;
      });

      if (!updated) {
        throw notFoundError("ActionBoardShare", shareId);
      }

      return { ...state, actionBoardShares };
    });

    return updated!;
  },
};
