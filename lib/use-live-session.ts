"use client";

import { useEffect, useState } from "react";

import { getSessionSnapshotAction } from "@/app/actions/sessions";
import { subscribeToCoreSessionRealtime } from "@/lib/realtime/subscriptions";
import { isSupabaseMode } from "@/lib/backend-mode";
import type { SessionSnapshot } from "@/services/backend/types";

export function useLiveSession(sessionId: string): SessionSnapshot | null | undefined {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null | undefined>(
    isSupabaseMode() ? undefined : null,
  );

  useEffect(() => {
    if (!isSupabaseMode()) {
      return;
    }

    let cancelled = false;

    // The state update happens asynchronously after the awaited fetch resolves,
    // so it is not a synchronous set-state-in-effect.
    const sync = async () => {
      const result = await getSessionSnapshotAction(sessionId);
      if (cancelled) {
        return;
      }
      setSnapshot(result.ok ? result.data : null);
    };

    void sync();
    const unsubscribe = subscribeToCoreSessionRealtime(sessionId, () => {
      void sync();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [sessionId]);

  return snapshot;
}
