"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { useRoom } from "@/components/session-room/session-room-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getParticipantContext } from "@/lib/participant-context";
import { THIS_OR_THAT_PROMPTS } from "@/lib/warmup-content";
import { cn } from "@/lib/utils";

export function ThisOrThatWarmup() {
  const { session, store, viewer } = useRoom();
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = THIS_OR_THAT_PROMPTS[promptIndex];

  const responses = useMemo(
    () =>
      store.warmupResponses.filter(
        (response) =>
          response.sessionId === session.id &&
          response.response.type === "this_or_that" &&
          response.response.promptId === prompt.id,
      ),
    [store.warmupResponses, session.id, prompt.id],
  );

  const countA = responses.filter(
    (r) => r.response.type === "this_or_that" && r.response.choice === "a",
  ).length;
  const countB = responses.filter(
    (r) => r.response.type === "this_or_that" && r.response.choice === "b",
  ).length;
  const total = countA + countB;

  const myChoice = viewer.participantId
    ? responses.find((r) => r.participantId === viewer.participantId)?.response
    : undefined;
  const mine =
    myChoice && myChoice.type === "this_or_that" ? myChoice.choice : null;

  const choose = (choice: "a" | "b") => {
    if (!viewer.participantId) {
      return;
    }
    const ctx = getParticipantContext(session.id);
    if (!ctx) {
      return;
    }
    void api.submitWarmupResponse(
      {
        sessionId: session.id,
        participantId: viewer.participantId,
        warmupType: "this_or_that",
        response: { type: "this_or_that", promptId: prompt.id, choice },
      },
      ctx,
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <p className="text-center text-sm text-muted-foreground">
            Prompt {promptIndex + 1} of {THIS_OR_THAT_PROMPTS.length}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChoiceTile
              label={prompt.optionA}
              count={countA}
              total={total}
              selected={mine === "a"}
              disabled={!viewer.participantId}
              onClick={() => choose("a")}
            />
            <ChoiceTile
              label={prompt.optionB}
              count={countB}
              total={total}
              selected={mine === "b"}
              disabled={!viewer.participantId}
              onClick={() => choose("b")}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {total} response{total === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      {viewer.isFacilitator ? (
        <FacilitatorPanel>
          <Button
            variant="secondary"
            disabled={promptIndex >= THIS_OR_THAT_PROMPTS.length - 1}
            onClick={() =>
              setPromptIndex((index) =>
                Math.min(index + 1, THIS_OR_THAT_PROMPTS.length - 1),
              )
            }
          >
            Next prompt
            <ArrowRight />
          </Button>
        </FacilitatorPanel>
      ) : null}
    </div>
  );
}

function ChoiceTile({
  label,
  count,
  total,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  total: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 text-left transition-colors disabled:cursor-not-allowed",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:bg-accent/40",
      )}
    >
      <div
        className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-2">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-sm text-muted-foreground">
          {count} · {pct}%
        </span>
      </div>
    </button>
  );
}
