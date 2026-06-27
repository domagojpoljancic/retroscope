"use client";

import { PhaseHeading } from "@/components/session-room/phase-shell";
import { useRoom } from "@/components/session-room/session-room-context";
import { SummaryView } from "@/components/summary/summary-view";

export function SummaryPhase() {
  const { session } = useRoom();

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Summary"
        description="The retro is complete. Review outcomes and follow through on the action board."
      />
      <SummaryView sessionId={session.id} />
    </div>
  );
}
