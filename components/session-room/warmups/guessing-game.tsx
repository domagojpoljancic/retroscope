"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Eye, Lightbulb } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
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

  const submit = () => {
    if (!viewer.participantId || !guess.trim()) {
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
          answer: guess.trim(),
          isCorrect: checkTriviaAnswer(question.id, guess.trim()),
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
      <Card>
        <CardContent className="space-y-4 p-4">
          <p className="text-center text-xs text-muted-foreground">
            Question {questionIndex + 1} of {TRIVIA_QUESTIONS.length}
          </p>
          <p className="text-center text-lg font-semibold">{question.question}</p>
          {question.hint ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lightbulb className="size-3.5" />
              {question.hint}
            </p>
          ) : null}

          {viewer.participantId && !revealed ? (
            <div className="mx-auto flex max-w-sm gap-2">
              <Input
                placeholder={myGuess ? "Update your guess" : "Your guess"}
                value={guess}
                onChange={(event) => setGuess(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submit();
                  }
                }}
              />
              <Button onClick={submit} disabled={!guess.trim()}>
                {myGuess ? "Update" : "Submit"}
              </Button>
            </div>
          ) : null}

          {myGuess && !revealed ? (
            <p className="text-center text-xs text-muted-foreground">
              Your guess is locked in: <strong>{myGuess.answer}</strong>
            </p>
          ) : null}

          {revealed ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Answer
                </p>
                <p className="text-lg font-semibold">{question.answer}</p>
              </div>
              <div className="space-y-2">
                {guesses.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    No guesses submitted.
                  </p>
                ) : (
                  guesses.map((g) => (
                    <div
                      key={g.participantId}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border p-2",
                        g.isCorrect
                          ? "border-emerald-400/60 bg-emerald-500/5"
                          : "border-border",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <Avatar
                          name={participantName(g.participantId)}
                          className="size-6 text-[10px]"
                        />
                        {participantName(g.participantId)}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {g.answer}
                        {g.isCorrect ? (
                          <Badge variant="default">Correct</Badge>
                        ) : null}
                        {!g.isCorrect && g.participantId === closestId ? (
                          <Badge variant="secondary">Closest</Badge>
                        ) : null}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {guesses.length} guess{guesses.length === 1 ? "" : "es"} submitted ·
              hidden until reveal
            </p>
          )}
        </CardContent>
      </Card>

      {viewer.isFacilitator ? (
        <FacilitatorPanel>
          {!revealed ? (
            <Button onClick={() => setRevealed(true)}>
              <Eye />
              Reveal answer
            </Button>
          ) : (
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
          )}
        </FacilitatorPanel>
      ) : null}
    </div>
  );
}
