"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

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
      <Card className="scope-frame overflow-hidden">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <span className="vhs-label">This · or · That</span>
            <span className="retro-meta">
              {String(promptIndex + 1).padStart(2, "0")} /{" "}
              {String(THIS_OR_THAT_PROMPTS.length).padStart(2, "0")}
            </span>
          </div>
          <div className="relative grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <ChoiceTile
              label={prompt.optionA}
              tone="violet"
              count={countA}
              total={total}
              selected={mine === "a"}
              disabled={!viewer.participantId}
              onClick={() => choose("a")}
            />
            <div className="hidden items-center justify-center sm:flex">
              <span className="vhs-label">VS</span>
            </div>
            <ChoiceTile
              label={prompt.optionB}
              tone="teal"
              count={countB}
              total={total}
              selected={mine === "b"}
              disabled={!viewer.participantId}
              onClick={() => choose("b")}
            />
          </div>
          <p className="retro-meta text-center">
            {total} response{total === 1 ? "" : "s"} recorded
          </p>
        </CardContent>
      </Card>

      {viewer.isFacilitator ? (
        <div className="flex justify-center">
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
        </div>
      ) : null}
    </div>
  );
}

function ChoiceTile({
  label,
  tone,
  count,
  total,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  tone: "violet" | "teal";
  count: number;
  total: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  const fill = tone === "violet" ? "bg-retro-violet/15" : "bg-retro-teal/15";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 text-left transition-all disabled:cursor-not-allowed",
        selected
          ? "border-transparent shadow-md ring-2 ring-primary [background:var(--retro-gradient)] [background-clip:padding-box]"
          : "border-border hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm",
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all",
          selected ? "bg-white/15" : fill,
        )}
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-base font-semibold",
            selected && "text-white",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "retro-timer text-sm",
            selected ? "text-white/90" : "text-muted-foreground",
          )}
        >
          {pct}%
        </span>
      </div>
      <p
        className={cn(
          "retro-meta relative mt-1 text-[10px]",
          selected ? "text-white/80" : undefined,
        )}
      >
        {count} {count === 1 ? "vote" : "votes"}
        {selected ? " · your pick" : ""}
      </p>
    </button>
  );
}
