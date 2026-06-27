"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { PhaseHeading, WaitingState } from "@/components/session-room/phase-shell";
import { useRoom } from "@/components/session-room/session-room-context";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { PermissionHint } from "@/components/ui-state/permission-hint";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  suggestVotesPerParticipant,
  suggestVotingSeconds,
} from "@/lib/session-flow";
import { api } from "@/lib/api";
import { formatTimerDisplay } from "@/lib/timer";
import {
  validateTimerDuration,
  validateVotesPerParticipant,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

const TIMER_OPTIONS = [120, 180, 300];

export function VotingSetupPhase() {
  const { session, store, viewer, goToPhase } = useRoom();

  const groups = store.groups.filter(
    (group) => group.sessionId === session.id && group.deletedAt === null,
  );
  const ungroupedRevealed = store.cards.filter(
    (card) =>
      card.sessionId === session.id &&
      card.deletedAt === null &&
      card.groupId === null &&
      card.isRevealed,
  );
  const targetCount = groups.length + ungroupedRevealed.length;

  const [votes, setVotes] = useState(suggestVotesPerParticipant(targetCount));
  const [seconds, setSeconds] = useState(suggestVotingSeconds(targetCount));
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const start = async () => {
    const votesCheck = validateVotesPerParticipant(votes);
    if (!votesCheck.ok) {
      setError(votesCheck.error);
      return;
    }
    const timerCheck = validateTimerDuration(seconds);
    if (!timerCheck.ok) {
      setError(timerCheck.error);
      return;
    }
    if (targetCount === 0) {
      setError("No revealed cards or themes to vote on yet.");
      return;
    }

    setError(null);
    setStarting(true);
    try {
      await api.upsertVotingSettings(session.id, {
        votesPerParticipant: votes,
        allowMultipleVotesPerTarget: true,
      });
      const timer = await api.upsertTimer({
        sessionId: session.id,
        phase: "voting",
        durationSeconds: seconds,
      });
      await api.startTimer(timer.id);
      goToPhase("voting");
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Could not start voting.",
      );
    } finally {
      setStarting(false);
    }
  };

  if (!viewer.isFacilitator) {
    return (
      <div className="space-y-4">
        <PhaseHeading title="Voting setup" />
        <WaitingState description="The facilitator is configuring voting. Get ready to pick your top topics." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Voting setup"
        description="Decide how many votes each person gets and how long voting lasts."
      />

      {targetCount === 0 ? (
        <PermissionHint message="No vote targets yet. Reveal and group cards before starting voting." />
      ) : null}

      <Card>
        <CardContent className="space-y-5 p-4">
          <p className="text-sm text-muted-foreground">
            {groups.length} theme{groups.length === 1 ? "" : "s"} and{" "}
            {ungroupedRevealed.length} ungrouped card
            {ungroupedRevealed.length === 1 ? "" : "s"} are up for voting (
            {targetCount} target{targetCount === 1 ? "" : "s"}).
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium">Votes per participant</p>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setVotes((v) => Math.max(1, v - 1))}
                aria-label="Fewer votes"
              >
                −
              </Button>
              <span className="w-10 text-center text-lg font-semibold">
                {votes}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setVotes((v) => Math.min(12, v + 1))}
                aria-label="More votes"
              >
                +
              </Button>
              <span className="text-xs text-muted-foreground">
                Suggested: {suggestVotesPerParticipant(targetCount)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Voting timer</p>
            <div className="flex flex-wrap gap-2">
              {TIMER_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSeconds(option)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                    seconds === option
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent/40",
                  )}
                >
                  {formatTimerDisplay(option)}
                </button>
              ))}
            </div>
          </div>

          <InlineValidationMessage message={error} />
        </CardContent>
      </Card>

      <FacilitatorPanel>
        <Button onClick={() => void start()} disabled={starting || targetCount === 0}>
          <Play />
          {starting ? "Starting…" : "Start voting"}
        </Button>
      </FacilitatorPanel>
    </div>
  );
}
