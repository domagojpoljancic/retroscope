import { nowIso } from "@/lib/dates";
import { createId } from "@/lib/id";
import { isValidFrameworkColumn } from "@/lib/framework-columns";
import type {
  FrameworkType,
  GroupingPermission,
  Session,
  SessionPhase,
  SessionStatus,
  WarmupType,
} from "@/types";
import {
  findById,
  getMockStore,
  notFoundError,
  updateMockStore,
} from "@/services/store";

export interface CreateSessionInput {
  workspaceId: string;
  createdByUserId: string;
  name: string;
  sessionCode: string;
  warmupType: WarmupType;
  frameworkType: FrameworkType;
  anonymousCards?: boolean;
  facilitatorParticipates?: boolean;
  groupingPermission?: GroupingPermission;
}

export interface UpdateSessionInput {
  name?: string;
  warmupType?: WarmupType;
  frameworkType?: FrameworkType;
  anonymousCards?: boolean;
  facilitatorParticipates?: boolean;
  groupingPermission?: GroupingPermission;
  currentPhase?: SessionPhase;
  status?: SessionStatus;
  startedAt?: string | null;
  endedAt?: string | null;
}

export const sessionService = {
  listByWorkspace(workspaceId: string): Session[] {
    return getMockStore().sessions.filter(
      (session) => session.workspaceId === workspaceId,
    );
  },

  getById(sessionId: string): Session | null {
    return findById(getMockStore().sessions, sessionId) ?? null;
  },

  getByCode(sessionCode: string): Session | null {
    const normalized = sessionCode.trim().toUpperCase();
    return (
      getMockStore().sessions.find(
        (session) => session.sessionCode.toUpperCase() === normalized,
      ) ?? null
    );
  },

  create(input: CreateSessionInput): Session {
    const createdAt = nowIso();
    const session: Session = {
      id: createId("session"),
      workspaceId: input.workspaceId,
      createdByUserId: input.createdByUserId,
      name: input.name,
      sessionCode: input.sessionCode.toUpperCase(),
      warmupType: input.warmupType,
      frameworkType: input.frameworkType,
      anonymousCards: input.anonymousCards ?? false,
      facilitatorParticipates: input.facilitatorParticipates ?? true,
      groupingPermission: input.groupingPermission ?? "facilitator_only",
      currentPhase: "lobby",
      status: "draft",
      createdAt,
      startedAt: null,
      endedAt: null,
    };

    updateMockStore((state) => ({
      ...state,
      sessions: [...state.sessions, session],
    }));

    return session;
  },

  update(sessionId: string, input: UpdateSessionInput): Session {
    let updated: Session | null = null;

    updateMockStore((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        if (
          input.frameworkType &&
          session.frameworkType !== input.frameworkType
        ) {
          // Framework changes are allowed at draft/lobby only in MVP mock layer.
        }

        updated = {
          ...session,
          ...input,
        };
        return updated;
      });

      if (!updated) {
        throw notFoundError("Session", sessionId);
      }

      return { ...state, sessions };
    });

    return updated!;
  },

  advancePhase(sessionId: string, nextPhase: SessionPhase): Session {
    return sessionService.update(sessionId, { currentPhase: nextPhase });
  },

  start(sessionId: string): Session {
    return sessionService.update(sessionId, {
      status: "active",
      startedAt: nowIso(),
      currentPhase: "warmup",
    });
  },

  complete(sessionId: string): Session {
    return sessionService.update(sessionId, {
      status: "completed",
      endedAt: nowIso(),
      currentPhase: "summary",
    });
  },

  archive(sessionId: string): Session {
    return sessionService.update(sessionId, { status: "archived" });
  },

  validateFrameworkColumn(
    sessionId: string,
    columnId: string,
  ): boolean {
    const session = sessionService.getById(sessionId);
    if (!session) {
      return false;
    }
    return isValidFrameworkColumn(session.frameworkType, columnId);
  },
};
