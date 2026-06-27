"use client";

import { useCallback, useEffect, useState } from "react";

import { getSessionSnapshotAction } from "@/app/actions/sessions";
import { subscribeToCoreSessionRealtime } from "@/lib/realtime/subscriptions";
import { isSupabaseMode } from "@/lib/backend-mode";
import type { SessionSnapshot } from "@/services/backend/types";

export function useLiveSession(sessionId: string): SessionSnapshot | null | undefined {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null | undefined>(
    isSupabaseMode() ? undefined : null,
  );

  const refresh = useCallback(async () => {
    if (!isSupabaseMode()) {
      return;
    }
    const result = await getSessionSnapshotAction(sessionId);
    if (result.ok) {
      setSnapshot(result.data);
    } else {
      setSnapshot(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isSupabaseMode()) {
      return;
    }
    void refresh();
    return subscribeToCoreSessionRealtime(sessionId, () => {
      void refresh();
    });
  }, [sessionId, refresh]);

  return snapshot;
}
