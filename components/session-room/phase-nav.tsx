"use client";

import { Check } from "lucide-react";

import { useRoom } from "@/components/session-room/session-room-context";
import { SESSION_PHASES } from "@/lib/phases";
import { cn } from "@/lib/utils";

export function PhaseNav() {
  const { session, viewer, hasActionReview, goToPhase } = useRoom();

  const phases = SESSION_PHASES.filter(
    (phase) => phase.id !== "previous_action_review" || hasActionReview,
  );

  const currentOrder = SESSION_PHASES.find(
    (phase) => phase.id === session.currentPhase,
  )?.order ?? 0;

  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-1">
      {phases.map((phase, index) => {
        const isCurrent = phase.id === session.currentPhase;
        const isDone = phase.order < currentOrder;
        const clickable = viewer.isFacilitator;
        return (
          <button
            key={phase.id}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && goToPhase(phase.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              isCurrent
                ? "border-transparent bg-[image:var(--retro-gradient)] text-white shadow-sm"
                : isDone
                  ? "border-border bg-secondary text-secondary-foreground"
                  : "border-border bg-background text-muted-foreground",
              clickable && !isCurrent && "hover:bg-accent/50",
              !clickable && "cursor-default",
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full font-mono text-[10px]",
                isCurrent
                  ? "bg-white/25"
                  : isDone
                    ? "bg-primary/15 text-primary"
                    : "bg-muted",
              )}
            >
              {isDone ? <Check className="size-3" /> : index + 1}
            </span>
            {phase.label}
          </button>
        );
      })}
    </nav>
  );
}
