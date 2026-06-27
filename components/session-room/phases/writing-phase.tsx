"use client";

import { useState } from "react";
import {
  Eye,
  Pause,
  Pencil,
  Play,
  Plus,
  SquareCheckBig,
  TimerReset,
  Trash2,
} from "lucide-react";

import { BoardCard } from "@/components/session-room/board-card";
import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { PhaseHeading } from "@/components/session-room/phase-shell";
import { TimerDisplay } from "@/components/session-room/timer-display";
import { useRoom } from "@/components/session-room/session-room-context";
import { ConfirmDialog } from "@/components/ui-state/confirm-dialog";
import { EmptyState } from "@/components/ui-state/empty-state";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { PermissionHint } from "@/components/ui-state/permission-hint";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { revealCard, revealCards } from "@/lib/card-reveal";
import { getParticipantContext } from "@/lib/participant-context";
import { isTimerExpired } from "@/lib/timer";
import { PERMISSION_MESSAGES, validateCardText } from "@/lib/validation";
import type { FrameworkColumnDefinition } from "@/lib/framework-columns";
import type { RetroCard } from "@/types";

export function WritingPhase() {
  const { session, store, viewer, columns, goToPhase, participants, participantName } =
    useRoom();

  const timer = store.timers.find(
    (item) => item.sessionId === session.id && item.phase === "writing",
  );

  const cards = store.cards.filter(
    (card) => card.sessionId === session.id && card.deletedAt === null,
  );

  const myUnrevealed = cards.filter(
    (card) =>
      card.participantId === viewer.participantId && !card.isRevealed,
  );

  const unrevealedByParticipant = participants
    .map((participant) => ({
      participant,
      hidden: cards.filter(
        (card) => card.participantId === participant.id && !card.isRevealed,
      ),
    }))
    .filter((entry) => entry.hidden.length > 0);

  const timerEnded = timer ? isTimerExpired(timer) : false;

  const endWriting = () => {
    if (timer) {
      void api.endTimer(timer.id);
    }
    goToPhase("reveal_group");
  };

  const addTime = () => {
    if (!timer) {
      return;
    }
    void api.extendTimer(timer.id, 60);
  };

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Writing"
        description="Add your cards privately. Reveal them when you're ready — hidden cards stay obfuscated for everyone else."
        action={
          timer ? (
            <TimerDisplay timer={timer} />
          ) : (
            <span className="text-sm text-muted-foreground">Timer starting…</span>
          )
        }
      />

      {timerEnded ? (
        <PermissionHint message="Writing time has ended. The facilitator may move to reveal & group." />
      ) : null}

      {!viewer.participantId && !viewer.isFacilitator ? (
        <PermissionHint message="Switch to a participant to add cards." />
      ) : null}

      {viewer.participantId && myUnrevealed.length > 0 ? (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => revealCards(myUnrevealed, session.id)}
          >
            <Eye />
            Reveal all my cards ({myUnrevealed.length})
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <WritingColumn
            key={column.id}
            column={column}
            cards={cards.filter((card) => card.frameworkColumn === column.id)}
            timerEnded={Boolean(timerEnded)}
          />
        ))}
      </div>

      {viewer.isFacilitator && unrevealedByParticipant.length > 0 ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium">Reveal all cards from a participant</p>
            <div className="flex flex-wrap gap-2">
              {unrevealedByParticipant.map(({ participant, hidden }) => (
                <Button
                  key={participant.id}
                  size="sm"
                  variant="outline"
                  onClick={() => revealCards(hidden, session.id)}
                >
                  <Eye />
                  {participantName(participant.id)} ({hidden.length})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {viewer.isFacilitator ? (
        <FacilitatorPanel>
          {timer?.status === "running" ? (
            <Button
              variant="outline"
              onClick={() => void api.pauseTimer(timer.id)}
            >
              <Pause />
              Pause
            </Button>
          ) : timer?.status === "paused" ? (
            <Button
              variant="outline"
              onClick={() => void api.resumeTimer(timer.id)}
            >
              <Play />
              Resume
            </Button>
          ) : null}
          <Button variant="outline" onClick={addTime} disabled={!timer}>
            <TimerReset />
            +1 min
          </Button>
          <Button
            variant="outline"
            onClick={() => void api.revealSessionCards(session.id)}
          >
            <Eye />
            Reveal all cards
          </Button>
          <Button onClick={endWriting}>
            <SquareCheckBig />
            End writing
          </Button>
        </FacilitatorPanel>
      ) : null}
    </div>
  );
}

function WritingColumn({
  column,
  cards,
  timerEnded,
}: {
  column: FrameworkColumnDefinition;
  cards: RetroCard[];
  timerEnded: boolean;
}) {
  const { session, viewer, participantName } = useRoom();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RetroCard | null>(null);

  const canAdd = Boolean(viewer.participantId) && !timerEnded;

  const addCard = () => {
    const validation = validateCardText(draft);
    if (!validation.ok) {
      setDraftError(validation.error);
      return;
    }
    if (!viewer.participantId) {
      return;
    }
    const ctx = getParticipantContext(session.id);
    if (!ctx) {
      return;
    }
    setDraftError(null);
    void api.createCard(
      {
        sessionId: session.id,
        participantId: viewer.participantId,
        frameworkColumn: column.id,
        text: draft.trim(),
      },
      ctx,
    ).catch((error) => {
      toast(
        error instanceof Error ? error.message : "Could not add card.",
        "error",
      );
    });
    setDraft("");
  };

  const saveEdit = (cardId: string) => {
    const validation = validateCardText(editText);
    if (!validation.ok) {
      setEditError(validation.error);
      return;
    }
    const ctx = getParticipantContext(session.id);
    if (!ctx) {
      return;
    }
    setEditError(null);
    void api.updateCard(cardId, { text: editText.trim() }, ctx).catch((error) => {
      toast(
        error instanceof Error
          ? error.message
          : PERMISSION_MESSAGES.editOwnUnrevealed,
        "error",
      );
    });
    setEditingId(null);
    setEditText("");
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }
    const ctx = getParticipantContext(session.id);
    if (!ctx) {
      return;
    }
    void api.deleteCard(deleteTarget.id, ctx).catch((error) => {
      toast(
        error instanceof Error
          ? error.message
          : PERMISSION_MESSAGES.editOwnUnrevealed,
        "error",
      );
    });
    setDeleteTarget(null);
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: column.accentColor }}
          />
          <h3 className="text-sm font-semibold">{column.label}</h3>
          <span className="text-xs text-muted-foreground">{cards.length}</span>
        </div>

        <div className="space-y-2">
          {cards.map((card) => {
            const isOwner = card.participantId === viewer.participantId;
            const canEdit = isOwner && !card.isRevealed;
            if (editingId === card.id) {
              return (
                <div key={card.id} className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(event) => {
                      setEditText(event.target.value);
                      if (editError) {
                        setEditError(null);
                      }
                    }}
                    autoFocus
                  />
                  <InlineValidationMessage message={editError} />
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => saveEdit(card.id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            }
            return (
              <BoardCard
                key={card.id}
                card={card}
                viewerIsOwner={isOwner}
                locked={card.isRevealed}
                accentColor={column.accentColor}
                authorName={
                  session.anonymousCards
                    ? null
                    : participantName(card.participantId)
                }
              >
                {canEdit ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revealCard(card.id, session.id)}
                    >
                      <Eye />
                      Reveal
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(card.id);
                        setEditText(card.text);
                      }}
                    >
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(card)}
                    >
                      <Trash2 />
                      Delete
                    </Button>
                  </>
                ) : null}
                {viewer.isFacilitator && !isOwner && !card.isRevealed ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revealCard(card.id, session.id)}
                  >
                    <Eye />
                    Reveal
                  </Button>
                ) : null}
              </BoardCard>
            );
          })}
          {cards.length === 0 ? (
            <EmptyState
              compact
              description={`No cards in ${column.label} yet.`}
            />
          ) : null}
        </div>

        {canAdd ? (
          <div className="space-y-2 border-t border-border/60 pt-2">
            <Textarea
              placeholder={`Add to ${column.label}…`}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (draftError) {
                  setDraftError(null);
                }
              }}
              className="min-h-16"
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  addCard();
                }
              }}
            />
            <InlineValidationMessage message={draftError} />
            <Button
              size="sm"
              className="w-full"
              onClick={addCard}
            >
              <Plus />
              Add card
            </Button>
          </div>
        ) : null}

        {viewer.isFacilitator ? (
          <Button
            size="sm"
            variant="ghost"
            className="w-full text-xs"
            onClick={() => revealCards(cards, session.id)}
          >
            <Eye />
            Reveal all in column
          </Button>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete card?"
        description="This card will be removed from the board."
        confirmLabel="Delete"
        destructive
      />
    </Card>
  );
}
