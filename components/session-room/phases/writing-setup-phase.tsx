"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { PhaseHeading, WaitingState } from "@/components/session-room/phase-shell";
import { useRoom } from "@/components/session-room/session-room-context";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { validateTimerDuration } from "@/lib/validation";
import { cn } from "@/lib/utils";

const DURATION_OPTIONS = [3, 5, 7, 10];

export function WritingSetupPhase() {
  const { session, viewer, goToPhase, columns } = useRoom();
  const [minutes, setMinutes] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const start = async () => {
    const seconds = minutes * 60;
    const validation = validateTimerDuration(seconds);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setError(null);
    setStarting(true);
    try {
      const timer = await api.upsertTimer({
        sessionId: session.id,
        phase: "writing",
        durationSeconds: seconds,
      });
      await api.startTimer(timer.id);
      goToPhase("writing");
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Could not start writing timer.",
      );
    } finally {
      setStarting(false);
    }
  };

  if (!viewer.isFacilitator) {
    return (
      <div className="space-y-4">
        <PhaseHeading title="Writing setup" />
        <WaitingState description="The facilitator is setting the timer. Get ready to add your cards." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Writing setup"
        description="Choose how long the team has to add cards privately."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <p className="text-sm font-medium">Writing timer</p>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMinutes(option);
                  if (error) {
                    setError(null);
                  }
                }}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                  minutes === option
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent/40",
                )}
              >
                {option} min
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Board columns: {columns.map((column) => column.label).join(" · ")}
          </p>
          <InlineValidationMessage message={error} />
        </CardContent>
      </Card>

      <FacilitatorPanel>
        <Button onClick={() => void start()} disabled={starting}>
          <Play />
          {starting ? "Starting…" : `Start writing (${minutes} min)`}
        </Button>
      </FacilitatorPanel>
    </div>
  );
}
