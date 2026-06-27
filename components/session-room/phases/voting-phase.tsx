"use client";

import { Lock, Minus, Plus, TimerReset } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { PhaseHeading } from "@/components/session-room/phase-shell";
import { TimerDisplay } from "@/components/session-room/timer-display";
import { useRoom } from "@/components/session-room/session-room-context";
import { EmptyState } from "@/components/ui-state/empty-state";
import { PermissionHint } from "@/components/ui-state/permission-hint";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getParticipantContext } from "@/lib/participant-context";
import { isTimerExpired } from "@/lib/timer";
import { PERMISSION_MESSAGES } from "@/lib/validation";
import {
  countVotesForCard,
  countVotesForGroup,
  getRemainingVotes,
} from "@/lib/voting";
import { cn } from "@/lib/utils";
import type { Vote, VoteTargetType } from "@/types";

export function VotingPhase() {
  const { session, store, viewer, goToPhase } = useRoom();
  const { toast } = useToast();

  const settings = store.votingSettings.find((s) => s.sessionId === session.id);
  const votes = store.votes.filter((v) => v.sessionId === session.id);
  const timer = store.timers.find(
    (t) => t.sessionId === session.id && t.phase === "voting",
  );

  const groups = store.groups.filter(
    (g) => g.sessionId === session.id && g.deletedAt === null,
  );
  const cards = store.cards.filter(
    (c) => c.sessionId === session.id && c.deletedAt === null,
  );
  const ungroupedRevealed = cards.filter(
    (c) => c.groupId === null && c.isRevealed,
  );

  const remaining =
    settings && viewer.participantId
      ? getRemainingVotes(settings, votes, viewer.participantId)
      : 0;

  const votingEnded = timer ? isTimerExpired(timer) : false;
  const canVote = Boolean(viewer.participantId) && !votingEnded;

  const myVotesFor = (
    targetType: VoteTargetType,
    id: string,
  ): Vote[] =>
    votes.filter(
      (v) =>
        v.participantId === viewer.participantId &&
        v.targetType === targetType &&
        (targetType === "group" ? v.targetGroupId === id : v.targetCardId === id),
    );

  const castVote = (targetType: VoteTargetType, id: string) => {
    if (!canVote) {
      if (votingEnded) {
        toast(PERMISSION_MESSAGES.votingEnded, "info");
      }
      return;
    }
    if (!viewer.participantId) {
      return;
    }
    const ctx = getParticipantContext(session.id);
    if (!ctx) {
      return;
    }
    void api.castVote(
      {
        sessionId: session.id,
        participantId: viewer.participantId,
        targetType,
        targetCardId: targetType === "card" ? id : null,
        targetGroupId: targetType === "group" ? id : null,
      },
      ctx,
    ).catch((error) => {
      toast(
        error instanceof Error ? error.message : "No votes remaining.",
        "error",
      );
    });
  };

  const removeVote = (targetType: VoteTargetType, id: string) => {
    if (votingEnded) {
      toast(PERMISSION_MESSAGES.votingEnded, "info");
      return;
    }
    const mine = myVotesFor(targetType, id);
    const ctx = getParticipantContext(session.id);
    if (mine.length > 0 && ctx) {
      void api.removeVote(mine[0].id, ctx).then(() => {
        toast("Vote moved.", "success");
      });
    }
  };

  const endVoting = () => {
    if (timer) {
      void api.endTimer(timer.id);
    }
    goToPhase("discussion");
  };

  const addTime = () => {
    if (!timer) {
      return;
    }
    void api.extendTimer(timer.id, 60);
  };

  const targets = [
    ...groups.map((group) => ({
      key: `group:${group.id}`,
      id: group.id,
      type: "group" as const,
      title: group.title,
      subtitle: `${cards.filter((c) => c.groupId === group.id).length} cards`,
      total: countVotesForGroup(votes, group.id),
    })),
    ...ungroupedRevealed.map((card) => ({
      key: `card:${card.id}`,
      id: card.id,
      type: "card" as const,
      title: card.text,
      subtitle: "Ungrouped card",
      total: countVotesForCard(votes, card.id),
    })),
  ];

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Voting"
        description="Spend your votes on the themes and cards that matter most. You can move votes around while voting is open."
        action={
          <div className="flex items-center gap-2">
            {viewer.participantId ? (
              <Badge variant={remaining > 0 ? "default" : "muted"}>
                {remaining} vote{remaining === 1 ? "" : "s"} left
              </Badge>
            ) : null}
            {timer ? <TimerDisplay timer={timer} /> : null}
          </div>
        }
      />

      {votingEnded ? (
        <PermissionHint message={PERMISSION_MESSAGES.votingEnded} />
      ) : remaining <= 0 && viewer.participantId ? (
        <PermissionHint message="You've used all your votes. Remove a vote to reassign." />
      ) : null}

      {targets.length === 0 ? (
        <EmptyState description="Nothing to vote on yet. Reveal and group cards first." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {targets.map((target) => {
            const mine = myVotesFor(target.type, target.id).length;
            return (
              <Card
                key={target.key}
                className={cn(mine > 0 && "border-primary/50")}
              >
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{target.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {target.subtitle} · {target.total} total vote
                      {target.total === 1 ? "" : "s"}
                    </p>
                  </div>
                  {viewer.participantId ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        disabled={mine === 0 || votingEnded}
                        onClick={() => removeVote(target.type, target.id)}
                        aria-label="Remove vote"
                      >
                        <Minus />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {mine}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        disabled={remaining <= 0 || votingEnded}
                        onClick={() => castVote(target.type, target.id)}
                        aria-label="Add vote"
                      >
                        <Plus />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="muted">{target.total}</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {viewer.isFacilitator ? (
        <FacilitatorPanel>
          <Button variant="outline" onClick={addTime} disabled={!timer}>
            <TimerReset />
            +1 min
          </Button>
          <Button onClick={endVoting}>
            <Lock />
            End voting
          </Button>
        </FacilitatorPanel>
      ) : null}
    </div>
  );
}
