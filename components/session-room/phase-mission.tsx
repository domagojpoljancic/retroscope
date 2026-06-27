"use client";

import { Compass, Users } from "lucide-react";

import { getPhaseMission, getPhaseTag } from "@/lib/phase-missions";
import { cn } from "@/lib/utils";
import type { SessionPhase } from "@/types";

type PhaseMissionProps = {
  phase: SessionPhase;
  /** Show the facilitator "up next" hint row. */
  isFacilitator?: boolean;
  /** Optional right-aligned content (timer, vote count, status badges). */
  aside?: React.ReactNode;
  /** Override the default mission copy (e.g. include warm-up name in title). */
  title?: string;
  blurb?: string;
  className?: string;
};

/**
 * The "current mission" banner shown at the top of every phase. It answers the
 * four first-time questions at a glance: where am I, what's happening, what can
 * participants do, and what should the facilitator do next.
 */
export function PhaseMission({
  phase,
  isFacilitator = false,
  aside,
  title,
  blurb,
  className,
}: PhaseMissionProps) {
  const mission = getPhaseMission(phase);

  return (
    <section
      className={cn(
        "retro-grid relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <span className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-retro-violet/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <span className="vhs-label">{getPhaseTag(phase)}</span>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title ?? mission.title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {blurb ?? mission.blurb}
          </p>
          <div className="flex flex-col gap-1.5 pt-1 sm:flex-row sm:flex-wrap sm:gap-2">
            <MissionHint
              icon={<Users className="size-3.5" />}
              label="Participants"
              text={mission.participants}
              tone="teal"
            />
            {isFacilitator ? (
              <MissionHint
                icon={<Compass className="size-3.5" />}
                label="You"
                text={mission.facilitator}
                tone="primary"
              />
            ) : null}
          </div>
        </div>
        {aside ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{aside}</div>
        ) : null}
      </div>
    </section>
  );
}

function MissionHint({
  icon,
  label,
  text,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  tone: "teal" | "primary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs",
        tone === "teal"
          ? "border-retro-teal/30 bg-retro-teal/5"
          : "border-primary/25 bg-primary/5",
      )}
    >
      <span
        className={cn(
          "flex items-center",
          tone === "teal" ? "text-retro-teal" : "text-primary",
        )}
      >
        {icon}
      </span>
      <span className="font-semibold text-foreground">{label}:</span>
      <span className="text-muted-foreground">{text}</span>
    </span>
  );
}
