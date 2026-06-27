"use client";

import { useRoom } from "@/components/session-room/session-room-context";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function ParticipantStrip() {
  const { participants, viewer, session } = useRoom();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {participants.map((participant) => {
        const isViewer = participant.id === viewer.participantId;
        const isFacilitator =
          participant.isFacilitatorParticipant ||
          participant.userId === session.createdByUserId;
        return (
          <div
            key={participant.id}
            className={cn(
              "flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-3 text-xs",
              isViewer ? "border-primary ring-1 ring-primary/30" : "border-border",
            )}
          >
            <Avatar name={participant.displayName} className="size-7 text-[10px]" />
            <span className="font-medium">
              {participant.displayName}
              {isFacilitator ? (
                <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  · host
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground">No participants yet.</p>
      ) : null}
    </div>
  );
}
