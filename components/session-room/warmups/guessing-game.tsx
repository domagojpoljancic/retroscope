"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Eye, Lightbulb, RotateCcw } from "lucide-react";

import { useRoom } from "@/components/session-room/session-room-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getParticipantContext } from "@/lib/participant-context";
import { TRIVIA_QUESTIONS, checkTriviaAnswer } from "@/lib/warmup-content";
import { cn } from "@/lib/utils";

function closestNumericGuess(
  answer: string,
  guesses: { participantId: string; answer: string }[],
): string | null {
  const target = Number(answer);
  if (Number.isNaN(target)) {
    return null;
  }
  let best: { participantId: string; diff: number } | null = null;
  for (const guess of guesses) {
    const value = Number(guess.answer);
    if (Number.isNaN(value)) {
      continue;
    }
    const diff = Math.abs(value - target);
    if (!best || diff < best.diff) {
      best = { participantId: guess.participantId, diff };
    }
  }
  return best?.participantId ?? null;
}

export function GuessingGameWarmup() {
  const { session, store, viewer, participantName } = useRoom();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState("");

  const question = TRIVIA_QUESTIONS[questionIndex];

  const guesses = useMemo(
    () =>
      store.warmupResponses
        .filter(
          (response) =>
            response.sessionId === session.id &&
            response.response.type === "guessing_game" &&
            response.response.questionId === question.id,
        )
        .map((response) => ({
          participantId: response.participantId,
          answer:
            response.response.type === "guessing_game"
              ? response.response.answer
              : "",
          isCorrect:
            response.response.type === "guessing_game"
              ? response.response.isCorrect
              : false,
        })),
    [store.warmupResponses, session.id, question.id],
  );

  const myGuess = viewer.participantId
    ? guesses.find((g) => g.participantId === viewer.participantId)
    : undefined;

  const closestId = closestNumericGuess(question.answer, guesses);

  const cleanedGuess = guess.trim().replace(/\s+/g, " ").slice(0, 60);

  const submit = () => {
    if (!viewer.participantId || cleanedGuess.length === 0) {
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
        warmupType: "guessing_game",
        response: {
          type: "guessing_game",
          questionId: question.id,
          answer: cleanedGuess,
          isCorrect: checkTriviaAnswer(question.id, cleanedGuess),
        },
      },
      ctx,
    );
    setGuess("");
  };

  const goToQuestion = (index: number) => {
    setQuestionIndex(index);
    setRevealed(false);
    setGuess("");
  };

  return (
    <div className="space-y-4">
      <Card className="scope-frame scanlines overflow-hidden">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <span className="vhs-label">
              <Lightbulb className="size-3" />
              Quiz Console
            </span>
            <span className="retro-meta">
              {String(questionIndex + 1).padStart(2, "0")} /{" "}
              {String(TRIVIA_QUESTIONS.length).padStart(2, "0")}
            </span>
          </div>
          <p className="text-center text-lg font-semibold">{question.question}</p>
          {question.hint ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="size-3.5" />
              {question.hint}
            </p>
          ) : null}

          {viewer.participantId && !revealed ? (
            <div className="mx-auto max-w-sm space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={myGuess ? "Update your guess" : "Type your guess…"}
                  value={guess}
                  maxLength={60}
                  onChange={(event) => setGuess(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      submit();
                    }
                  }}
                />
                <Button onClick={submit} disabled={cleanedGuess.length === 0}>
                  {myGuess ? "Update" : "Submit"}
                </Button>
              </div>
              {myGuess ? (
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <Check className="size-3.5 text-retro-teal" />
                  Your guess is in:{" "}
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-mono font-semibold text-secondary-foreground">
                    {myGuess.answer}
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}

          {revealed ? (
            <div className="space-y-3">
              <div className="retro-gradient-panel relative overflow-hidden rounded-xl p-4 text-center text-white shadow-md">
                <p className="retro-meta text-white/80">Correct answer</p>
                <p className="retro-timer text-2xl font-bold">
                  {question.answer}
                </p>
              </div>
              <div className="space-y-2">
                {guesses.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    No guesses submitted.
                  </p>
                ) : (
                  guesses.map((g) => {
                    const isClosest =
                      !g.isCorrect && g.participantId === closestId;
                    return (
                      <div
                        key={g.participantId}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg border p-2 transition-colors",
                          g.isCorrect
                            ? "border-retro-teal/60 bg-retro-teal/10 ring-1 ring-retro-teal/30"
                            : isClosest
                              ? "border-retro-coral/50 bg-retro-coral/10"
                              : "border-border",
                        )}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <Avatar
                            name={participantName(g.participantId)}
                            className="size-6 text-[10px]"
                            active={g.isCorrect}
                          />
                          {participantName(g.participantId)}
                        </span>
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {g.answer}
                          {g.isCorrect ? (
                            <Badge variant="status">Correct</Badge>
                          ) : null}
                          {isClosest ? (
                            <Badge variant="priority">Closest</Badge>
                          ) : null}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {guesses.length} guess{guesses.length === 1 ? "" : "es"} submitted ·
              waiting for facilitator reveal
            </p>
          )}
        </CardContent>
      </Card>

      {viewer.isFacilitator ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!revealed ? (
            <Button variant="secondary" onClick={() => setRevealed(true)}>
              <Eye />
              Reveal answer
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => goToQuestion(questionIndex)}
              >
                <RotateCcw />
                Hide answer
              </Button>
              <Button
                variant="secondary"
                disabled={questionIndex >= TRIVIA_QUESTIONS.length - 1}
                onClick={() =>
                  goToQuestion(
                    Math.min(questionIndex + 1, TRIVIA_QUESTIONS.length - 1),
                  )
                }
              >
                Next question
                <ArrowRight />
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
