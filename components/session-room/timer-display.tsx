"use client";

import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatTimerDisplay, getRemainingSeconds } from "@/lib/timer";
import { useTick } from "@/lib/use-tick";
import { cn } from "@/lib/utils";
import type { TimerState } from "@/types";

export function TimerDisplay({
  timer,
  className,
}: {
  timer: TimerState;
  className?: string;
}) {
  useTick(timer.status === "running");
  const remaining = getRemainingSeconds(timer);
  const isUp = remaining <= 0 && timer.status !== "not_started";
  const isLow = remaining <= 30 && remaining > 0 && timer.status === "running";

  return (
    <Badge
      variant={isUp ? "default" : "muted"}
      className={cn(
        "gap-1 font-mono text-sm",
        isLow && "bg-retro-coral/15 text-retro-coral",
        className,
      )}
    >
      <Clock className="size-3.5" />
      {timer.status === "paused"
        ? `${formatTimerDisplay(remaining)} (paused)`
        : isUp
          ? "Time's up"
          : formatTimerDisplay(remaining)}
    </Badge>
  );
}
