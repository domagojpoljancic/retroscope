"use client";

import { Clock } from "lucide-react";

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
  const isPaused = timer.status === "paused";

  const readout = isUp ? "00:00" : formatTimerDisplay(remaining);
  const statusLabel = isUp
    ? "Time's up"
    : isPaused
      ? "Paused"
      : isLow
        ? "Hurry"
        : "Live";

  return (
    <span
      className={cn(
        "retro-timer inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm font-semibold tabular-nums shadow-sm",
        isUp
          ? "border-retro-coral/50 bg-retro-coral/15 text-retro-coral"
          : isLow
            ? "border-retro-coral/40 bg-retro-coral/10 text-retro-coral"
            : "border-border bg-foreground text-background",
        className,
      )}
      role="timer"
      aria-label={`${statusLabel}: ${readout}`}
    >
      <Clock className="size-3.5 opacity-80" />
      {readout}
      <span
        className={cn(
          "ml-0.5 rounded px-1 text-[9px] uppercase tracking-widest",
          isUp || isLow ? "bg-retro-coral/20" : "bg-background/20",
        )}
      >
        {statusLabel}
      </span>
    </span>
  );
}
