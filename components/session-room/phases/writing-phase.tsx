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
  Users,
} from "lucide-react";

import { BoardCard } from "@/components/session-room/board-card";
import { FacilitatorCommandBar } from "@/components/session-room/command-bar";
import { PhaseMission } from "@/components/session-room/phase-mission";
import { TimerDisplay } from "@/components/session-room/timer-display";
import { useRoom } from "@/components/session-room/session-room-context";
import { ConfirmDialog } from "@/components/ui-state/confirm-dialog";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { PermissionHint } from "@/components/ui-state/permission-hint";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { canEditCard, canRevealCard, isCardOwner } from "@/lib/card-permissions";
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

  const hiddenCount = cards.filter((card) => !card.isRevealed).length;

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
      <PhaseMission
        phase="writing"
        isFacilitator={viewer.isFacilitator}
        aside={
          timer ? (
            <TimerDisplay timer={timer} className="h-9 px-3 text-base" />
          ) : (
            <span className="text-sm text-muted-foreground">Timer starting…</span>
          )
        }
      />

      {timerEnded ? (
        <PermissionHint message="Writing time has ended. The facilitator can move to reveal & group." />
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

      {viewer.isFacilitator ? (
        <FacilitatorCommandBar
          hint="End writing when the team is done."
          status={
            <>
              {timer ? <TimerDisplay timer={timer} /> : null}
              <span className="retro-meta inline-flex items-center gap-1.5">
                <Eye className="size-3.5 text-primary" />
                {hiddenCount} hidden · {cards.length - hiddenCount} revealed
              </span>
            </>
          }
          secondary={
            <>
              {timer?.status === "running" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void api.pauseTimer(timer.id)}
                >
                  <Pause />
                  Pause
                </Button>
              ) : timer?.status === "paused" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void api.resumeTimer(timer.id)}
                >
                  <Play />
                  Resume
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={addTime}
                disabled={!timer}
              >
                <TimerReset />
                +1 min
              </Button>
              <Menu
                label="Reveal"
                icon={<Eye />}
                openUp
                align="end"
              >
                <MenuItem
                  icon={<Eye />}
                  onSelect={() => void api.revealSessionCards(session.id)}
                >
                  Reveal all cards
                </MenuItem>
                <MenuSeparator />
                <MenuLabel>By column</MenuLabel>
                {columns.map((column) => {
                  const columnHidden = cards.filter(
                    (card) =>
                      card.frameworkColumn === column.id && !card.isRevealed,
                  );
                  return (
                    <MenuItem
                      key={column.id}
                      icon={<Eye />}
                      disabled={columnHidden.length === 0}
                      onSelect={() => revealCards(columnHidden, session.id)}
                    >
                      {column.label} ({columnHidden.length})
                    </MenuItem>
                  );
                })}
                {unrevealedByParticipant.length > 0 ? (
                  <>
                    <MenuSeparator />
                    <MenuLabel>By participant</MenuLabel>
                    {unrevealedByParticipant.map(({ participant, hidden }) => (
                      <MenuItem
                        key={participant.id}
                        icon={<Users />}
                        onSelect={() => revealCards(hidden, session.id)}
                      >
                        {participantName(participant.id)} ({hidden.length})
                      </MenuItem>
                    ))}
                  </>
                ) : null}
              </Menu>
            </>
          }
          primary={
            <Button onClick={endWriting}>
              <SquareCheckBig />
              End writing
            </Button>
          }
        />
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
          <span className="retro-meta ml-auto text-[10px]">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </span>
        </div>

        {cards.length > 0 ? (
          <div className="space-y-2">
            {cards.map((card) => {
              const isOwner = isCardOwner(card, viewer);
              const canEdit = canEditCard(card, viewer);
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
                  {!isOwner && canRevealCard(card, viewer) ? (
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
          </div>
        ) : null}

        {canAdd ? (
          <div className="space-y-2">
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
            <Button size="sm" className="w-full" onClick={addCard}>
              <Plus />
              Add card
            </Button>
          </div>
        ) : cards.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-center text-xs text-muted-foreground">
            No cards yet.
          </p>
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
