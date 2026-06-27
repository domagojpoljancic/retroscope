"use client";

import Link from "next/link";
import { Users } from "lucide-react";

import { useRoom } from "@/components/session-room/session-room-context";
import { TimerDisplay } from "@/components/session-room/timer-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FRAMEWORK_LABELS } from "@/lib/labels";
import { getPhaseDefinition } from "@/lib/phases";
import type { TimerPhase } from "@/types";

export function SessionTopBar() {
  const { session, store, participants } = useRoom();
  const phase = getPhaseDefinition(session.currentPhase);

  const timerPhase: TimerPhase | null =
    session.currentPhase === "writing"
      ? "writing"
      : session.currentPhase === "voting"
        ? "voting"
        : null;

  const activeTimer = timerPhase
    ? store.timers.find(
        (timer) => timer.sessionId === session.id && timer.phase === timerPhase,
      )
    : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {session.name}
          </h1>
          <Badge variant="secondary">{phase.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {FRAMEWORK_LABELS[session.frameworkType]} · Code{" "}
          <span className="font-mono">{session.sessionCode}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeTimer && activeTimer.status !== "not_started" ? (
          <TimerDisplay timer={activeTimer} />
        ) : null}
        <Badge variant="muted" className="gap-1">
          <Users className="size-3.5" />
          {participants.length}
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">Exit</Link>
        </Button>
      </div>
    </div>
  );
}
