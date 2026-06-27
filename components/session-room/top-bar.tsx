"use client";

import Link from "next/link";
import { ChevronDown, LogOut, TerminalSquare, Users } from "lucide-react";

import { BrandLens } from "@/components/layout/brand-mark";
import { ParticipantStrip } from "@/components/session-room/participant-strip";
import { useRoom } from "@/components/session-room/session-room-context";
import { Button } from "@/components/ui/button";
import { FRAMEWORK_LABELS } from "@/lib/labels";
import { getPhaseDefinition } from "@/lib/phases";
import { cn } from "@/lib/utils";

export function SessionTopBar({
  devToolsEnabled = false,
  onToggleDevTools,
}: {
  devToolsEnabled?: boolean;
  onToggleDevTools?: () => void;
} = {}) {
  const { session, participants } = useRoom();
  const phase = getPhaseDefinition(session.currentPhase);

  return (
    <div className="retro-grid time-scan relative space-y-3 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLens size="sm" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                {session.name}
              </h1>
              <span className="vhs-label">{phase.label}</span>
            </div>
            <p className="retro-meta">
              {FRAMEWORK_LABELS[session.frameworkType]} · {session.sessionCode}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <details className="group relative">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50">
              <Users className="size-3.5 text-primary" />
              {participants.length}
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 z-40 mt-2 w-72 max-w-[90vw] rounded-xl border border-border bg-card p-3 shadow-lg">
              <p className="retro-meta mb-2">Participants · {participants.length}</p>
              <ParticipantStrip />
            </div>
          </details>

          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <LogOut />
              Exit
            </Link>
          </Button>

          {/* Unobtrusive dev control — not part of the normal product flow. */}
          <button
            type="button"
            onClick={() => onToggleDevTools?.()}
            aria-label={devToolsEnabled ? "Hide developer tools" : "Show developer tools"}
            title="Developer view tools"
            className={cn(
              "grid size-7 place-items-center rounded-md text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-muted-foreground",
              devToolsEnabled && "bg-accent text-foreground",
            )}
          >
            <TerminalSquare className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
