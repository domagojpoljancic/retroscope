"use client";

import { ArrowRight } from "lucide-react";

import { FacilitatorCommandBar } from "@/components/session-room/command-bar";
import { PhaseMission } from "@/components/session-room/phase-mission";
import { useRoom } from "@/components/session-room/session-room-context";
import { GuessingGameWarmup } from "@/components/session-room/warmups/guessing-game";
import { MoodCharacterWarmup } from "@/components/session-room/warmups/mood-character";
import { ThisOrThatWarmup } from "@/components/session-room/warmups/this-or-that";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WARMUP_LABELS } from "@/lib/labels";

export function WarmupPhase() {
  const { session, store, viewer, participants, advance } = useRoom();

  const submittedCount = store.warmupResponses.filter(
    (response) => response.sessionId === session.id,
  ).length;
  const participantTotal = participants.filter(
    (p) => !p.isFacilitatorParticipant || session.facilitatorParticipates,
  ).length;

  const viewerSubmitted = viewer.participantId
    ? store.warmupResponses.some(
        (response) =>
          response.sessionId === session.id &&
          response.participantId === viewer.participantId,
      )
    : false;

  return (
    <div className="space-y-4">
      <PhaseMission
        phase="warmup"
        isFacilitator={viewer.isFacilitator}
        title={`Warm up · ${WARMUP_LABELS[session.warmupType]}`}
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">
              {submittedCount}/{participantTotal} submitted
            </Badge>
            {viewer.participantId ? (
              <Badge variant={viewerSubmitted ? "secondary" : "default"}>
                {viewerSubmitted ? "You submitted" : "Not submitted yet"}
              </Badge>
            ) : null}
          </div>
        }
      />

      {session.warmupType === "mood_character" ? <MoodCharacterWarmup /> : null}
      {session.warmupType === "this_or_that" ? <ThisOrThatWarmup /> : null}
      {session.warmupType === "guessing_game" ? <GuessingGameWarmup /> : null}

      {viewer.isFacilitator ? (
        <FacilitatorCommandBar
          hint="Continue when the team has warmed up."
          status={
            <span className="retro-meta">
              {submittedCount}/{participantTotal} joined in
            </span>
          }
          primary={
            <Button onClick={advance}>
              Continue
              <ArrowRight />
            </Button>
          }
        />
      ) : null}
    </div>
  );
}
