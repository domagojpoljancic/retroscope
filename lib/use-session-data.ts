"use client";

import { useMemo } from "react";

import type { MockDataState } from "@/mock";
import { useLiveSession } from "@/lib/use-live-session";
import { useMockStore } from "@/lib/use-store";
import { isSupabaseMode } from "@/lib/backend-mode";
import type { SessionSnapshot } from "@/services/backend/types";

/**
 * Unified read model for session room components.
 * - Mock mode: returns data derived from localStorage mock store
 * - Supabase mode: returns live snapshot from server + realtime
 */
export function useSessionData(sessionId: string): SessionSnapshot | null | undefined {
  const mockStore = useMockStore();
  const liveSnapshot = useLiveSession(sessionId);

  return useMemo(() => {
    if (!isSupabaseMode()) {
      if (!mockStore) {
        return undefined;
      }
      const session = mockStore.sessions.find((item) => item.id === sessionId) ?? null;
      if (!session) {
        return null;
      }
      return buildSnapshotFromMockStore(mockStore, sessionId, session);
    }
    return liveSnapshot;
  }, [mockStore, liveSnapshot, sessionId]);
}

function buildSnapshotFromMockStore(
  store: MockDataState,
  sessionId: string,
  session: MockDataState["sessions"][number],
): SessionSnapshot {
  return {
    session,
    participants: store.participants.filter((p) => p.sessionId === sessionId),
    warmupResponses: store.warmupResponses.filter((r) => r.sessionId === sessionId),
    cards: store.cards.filter((c) => c.sessionId === sessionId && c.deletedAt === null),
    groups: store.groups.filter((g) => g.sessionId === sessionId && g.deletedAt === null),
    groupingEvents: store.groupingEvents.filter((e) => e.sessionId === sessionId),
    votingSettings:
      store.votingSettings.find((s) => s.sessionId === sessionId) ?? null,
    votes: store.votes.filter((v) => v.sessionId === sessionId),
    timers: store.timers.filter((t) => t.sessionId === sessionId),
    actionSuggestions: store.actionSuggestions.filter(
      (s) => s.sessionId === sessionId && s.deletedAt === null,
    ),
    actionItems: store.actionItems.filter(
      (a) => a.sourceSessionId === sessionId && a.deletedAt === null,
    ),
  };
}

/** Hook for components that need the full mock store (dashboard, actions board in mock mode). */
export function useAppStore(): MockDataState | null | undefined {
  const mockStore = useMockStore();
  if (isSupabaseMode()) {
    return undefined;
  }
  return mockStore;
}
