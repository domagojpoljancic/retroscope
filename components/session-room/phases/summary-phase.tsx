"use client";

import { PhaseMission } from "@/components/session-room/phase-mission";
import { useRoom } from "@/components/session-room/session-room-context";
import { SummaryView } from "@/components/summary/summary-view";

export function SummaryPhase() {
  const { session, viewer } = useRoom();

  return (
    <div className="space-y-4">
      <PhaseMission phase="summary" isFacilitator={viewer.isFacilitator} />
      <SummaryView sessionId={session.id} />
    </div>
  );
}
