"use client";

import { useState } from "react";
import {
  ArrowRight,
  Boxes,
  Eye,
  FolderPlus,
  Trash2,
  Undo2,
  X,
} from "lucide-react";

import { BoardCard } from "@/components/session-room/board-card";
import { FacilitatorCommandBar } from "@/components/session-room/command-bar";
import { PhaseMission } from "@/components/session-room/phase-mission";
import { useRoom } from "@/components/session-room/session-room-context";
import { ConfirmDialog } from "@/components/ui-state/confirm-dialog";
import { EmptyState } from "@/components/ui-state/empty-state";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { PermissionHint } from "@/components/ui-state/permission-hint";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { canGroupCards, canRevealCard, isCardOwner } from "@/lib/card-permissions";
import { revealCard, revealCards } from "@/lib/card-reveal";
import { getParticipantContext } from "@/lib/participant-context";
import { PERMISSION_MESSAGES, validateGroupTitle } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function RevealGroupPhase() {
  const {
    session,
    store,
    viewer,
    columns,
    advance,
    participantName,
  } = useRoom();
  const { toast } = useToast();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupTitleError, setGroupTitleError] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [groupingMode, setGroupingMode] = useState(false);

  const cards = store.cards.filter(
    (card) => card.sessionId === session.id && card.deletedAt === null,
  );
  const groups = store.groups.filter(
    (group) => group.sessionId === session.id && group.deletedAt === null,
  );
  const recentEvent =
    store.groupingEvents.find(
      (event) => event.sessionId === session.id && event.undoneAt === null,
    ) ?? null;

  const revealedCards = cards.filter((card) => card.isRevealed);
  const canGroup = canGroupCards(session, viewer);

  const toggleSelect = (cardId: string) => {
    if (!canGroup) {
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const participantCtx = viewer.participantId
    ? getParticipantContext(session.id)
    : null;
  const facilitatorActor = { userId: "facilitator" };

  const createGroup = async () => {
    const ids = [...selected];
    if (ids.length < 1) {
      return;
    }
    const actor = participantCtx ?? facilitatorActor;
    try {
      const group = await api.createGroup(
        {
          sessionId: session.id,
          title: `Theme ${groups.length + 1}`,
          createdByParticipantId: viewer.participantId,
        },
        actor,
      );
      await api.groupCards(
        {
          sessionId: session.id,
          groupId: group.id,
          cardIds: ids,
          actorParticipantId: viewer.participantId,
        },
        actor,
      );
      setSelected(new Set());
      toast("Theme created.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not create theme.",
        "error",
      );
    }
  };

  const addSelectedToGroup = async (groupId: string) => {
    const ids = [...selected];
    if (ids.length === 0) {
      return;
    }
    const actor = participantCtx ?? facilitatorActor;
    try {
      await api.groupCards(
        {
          sessionId: session.id,
          groupId,
          cardIds: ids,
          actorParticipantId: viewer.participantId,
        },
        actor,
      );
      setSelected(new Set());
      toast("Cards added to theme.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not group cards.",
        "error",
      );
    }
  };

  const handleUndo = async () => {
    try {
      await api.undoGroupingEvent(session.id);
      toast("Last grouping undone.", "success");
    } catch {
      toast("Nothing to undo.", "error");
    }
  };

  const saveGroupTitle = () => {
    if (!editingGroupId) {
      return;
    }
    const validation = validateGroupTitle(groupTitle);
    if (!validation.ok) {
      setGroupTitleError(validation.error);
      return;
    }
    setGroupTitleError(null);
    void api.updateGroupTitle(editingGroupId, groupTitle.trim());
    setEditingGroupId(null);
  };

  const confirmDeleteGroup = async () => {
    if (!deleteGroupId) {
      return;
    }
    try {
      await api.deleteGroup(deleteGroupId);
      toast("Theme deleted.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not delete theme.",
        "error",
      );
    }
    setDeleteGroupId(null);
  };

  const revealedCount = revealedCards.length;
  const hiddenCount = cards.length - revealedCount;

  return (
    <div className="space-y-4">
      <PhaseMission
        phase="reveal_group"
        isFacilitator={viewer.isFacilitator}
        aside={
          <span className="retro-meta">
            {revealedCount} revealed · {hiddenCount} hidden
          </span>
        }
      />

      {!canGroup ? (
        <PermissionHint message={PERMISSION_MESSAGES.facilitatorOnlyGrouping} />
      ) : null}

      {revealedCards.length === 0 ? (
        <EmptyState
          description="No revealed cards yet. Reveal cards before grouping."
        />
      ) : null}

      {canGroup ? (
        <Card className={cn("border-primary/30", groupingMode && "bg-primary/5")}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="vhs-label">Grouping mode</span>
                <Switch
                  checked={groupingMode}
                  onCheckedChange={(value) => setGroupingMode(value)}
                  aria-label="Toggle grouping mode"
                />
                <span className="text-sm text-muted-foreground">
                  {groupingMode ? "On" : "Off"}
                </span>
              </div>
              <span className="text-sm">
                <span className="font-semibold text-foreground">
                  {selected.size}
                </span>{" "}
                card{selected.size === 1 ? "" : "s"} selected
              </span>
            </div>

            {groupingMode ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => void createGroup()}
                  disabled={selected.size < 1}
                >
                  <FolderPlus />
                  Create theme{selected.size > 0 ? ` (${selected.size})` : ""}
                </Button>
                {selected.size > 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected(new Set())}
                  >
                    Clear selection
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-muted-foreground"
                  onClick={() => void handleUndo()}
                  disabled={!recentEvent}
                >
                  <Undo2 />
                  Undo last
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Turn on grouping mode to select revealed cards and build themes.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {groups.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Boxes className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Themes</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {groups.map((group) => {
              const groupCards = cards.filter(
                (card) => card.groupId === group.id,
              );
              return (
                <Card key={group.id}>
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      {editingGroupId === group.id ? (
                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="flex gap-1.5">
                            <Input
                              value={groupTitle}
                              autoFocus
                              onChange={(event) => {
                                setGroupTitle(event.target.value);
                                if (groupTitleError) {
                                  setGroupTitleError(null);
                                }
                              }}
                              className="h-8"
                            />
                            <Button size="sm" onClick={saveGroupTitle}>
                              Save
                            </Button>
                          </div>
                          <InlineValidationMessage message={groupTitleError} />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            "text-left text-sm font-semibold",
                            canGroup && "hover:underline",
                          )}
                          onClick={() => {
                            if (canGroup) {
                              setEditingGroupId(group.id);
                              setGroupTitle(group.title);
                            }
                          }}
                        >
                          {group.title}
                          <Badge variant="muted" className="ml-2">
                            {groupCards.length}
                          </Badge>
                        </button>
                      )}
                      {canGroup ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0"
                          onClick={() => setDeleteGroupId(group.id)}
                          aria-label="Delete theme"
                        >
                          <Trash2 />
                        </Button>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      {groupCards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-2"
                        >
                          <span className="text-sm">{card.text}</span>
                          {canGroup ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-6 shrink-0"
                              aria-label="Remove from theme"
                              onClick={() => {
                                const actor = participantCtx ?? facilitatorActor;
                                void api.ungroupCards(session.id, [card.id], actor);
                              }}
                            >
                              <X />
                            </Button>
                          ) : null}
                        </div>
                      ))}
                      {groupCards.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Empty theme.
                        </p>
                      ) : null}
                    </div>

                    {canGroup && selected.size > 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => void addSelectedToGroup(group.id)}
                      >
                        Add {selected.size} selected here
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : revealedCards.length > 0 ? (
        <EmptyState
          compact
          description="No themes yet. Select revealed cards and create a theme."
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => {
          const columnCards = cards.filter(
            (card) => card.frameworkColumn === column.id && card.groupId === null,
          );
          return (
            <Card key={column.id}>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: column.accentColor }}
                  />
                  <h3 className="text-sm font-semibold">{column.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {columnCards.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnCards.map((card) => {
                    const isOwner = isCardOwner(card, viewer);
                    const selectable = canGroup && card.isRevealed && groupingMode;
                    return (
                      <BoardCard
                        key={card.id}
                        card={card}
                        viewerIsOwner={isOwner}
                        locked={card.isRevealed}
                        accentColor={column.accentColor}
                        selectable={selectable}
                        selected={selected.has(card.id)}
                        onSelect={() => toggleSelect(card.id)}
                        authorName={
                          session.anonymousCards
                            ? null
                            : participantName(card.participantId)
                        }
                      >
                        {canRevealCard(card, viewer) ? (
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
                  {columnCards.length === 0 ? (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      No ungrouped cards.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {viewer.isFacilitator ? (
        <FacilitatorCommandBar
          hint="Reveal and group, then continue to voting."
          status={
            <span className="retro-meta">
              {groups.length} theme{groups.length === 1 ? "" : "s"} ·{" "}
              {revealedCount} revealed
            </span>
          }
          secondary={
            <Button
              variant="outline"
              size="sm"
              onClick={() => revealCards(cards, session.id)}
              disabled={hiddenCount === 0}
            >
              <Eye />
              Reveal all cards
            </Button>
          }
          primary={
            <Button onClick={advance}>
              <ArrowRight />
              Continue to voting
            </Button>
          }
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteGroupId)}
        onClose={() => setDeleteGroupId(null)}
        onConfirm={confirmDeleteGroup}
        title="Delete theme?"
        description="Cards in this theme will return to the board ungrouped."
        confirmLabel="Delete theme"
        destructive
      />
    </div>
  );
}
