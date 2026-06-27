"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Lightbulb,
  ListPlus,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

import {
  ActionItemDialog,
  dateInputToIso,
  emptyActionForm,
  type ActionItemFormValues,
} from "@/components/actions/action-item-dialog";
import { FacilitatorCommandBar } from "@/components/session-room/command-bar";
import { PhaseMission } from "@/components/session-room/phase-mission";
import { useRoom } from "@/components/session-room/session-room-context";
import { EmptyState } from "@/components/ui-state/empty-state";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getParticipantContext } from "@/lib/participant-context";
import { buildRankedTargets } from "@/lib/session-results";
import { PRIORITY_LABELS } from "@/lib/labels";
import { validateActionSuggestion } from "@/lib/validation";
import type { ActionSuggestion } from "@/types";
import type { RankedTarget } from "@/lib/session-results";

type DialogState =
  | { mode: "create"; source?: RankedTarget }
  | { mode: "convert"; suggestion: ActionSuggestion }
  | null;

export function DiscussionPhase() {
  const {
    session,
    store,
    viewer,
    advance,
    participants,
    participantName,
  } = useRoom();
  const { toast } = useToast();

  const [dialog, setDialog] = useState<DialogState>(null);

  const cards = store.cards.filter(
    (c) => c.sessionId === session.id && c.deletedAt === null,
  );
  const groups = store.groups.filter(
    (g) => g.sessionId === session.id && g.deletedAt === null,
  );
  const votes = store.votes.filter((v) => v.sessionId === session.id);
  const ranked = buildRankedTargets(cards, groups, votes);

  const suggestions = store.actionSuggestions.filter(
    (s) => s.sessionId === session.id && s.deletedAt === null,
  );
  const actionItems = store.actionItems.filter(
    (item) => item.sourceSessionId === session.id && item.deletedAt === null,
  );

  const ownerOptions = participants.map((p) => p.displayName);

  const submitCreate = (values: ActionItemFormValues, source?: RankedTarget) => {
    void api.createActionItem({
      workspaceId: session.workspaceId,
      sourceSessionId: session.id,
      title: values.title,
      description: values.description || null,
      assignedToName: values.assignedToName,
      dueDate: dateInputToIso(values.dueDate),
      priority: values.priority,
      status: values.status,
      sourceCardId: source?.type === "card" ? source.id : null,
      sourceGroupId: source?.type === "group" ? source.id : null,
    }).then(() => {
      toast("Action item created.", "success");
    }).catch((error) => {
      toast(
        error instanceof Error ? error.message : "Could not create action item.",
        "error",
      );
    });
    setDialog(null);
  };

  const submitConvert = (
    values: ActionItemFormValues,
    suggestion: ActionSuggestion,
  ) => {
    void api.convertSuggestionToActionItem(suggestion.id, {
      title: values.title,
      description: values.description || null,
      assignedToName: values.assignedToName,
      dueDate: dateInputToIso(values.dueDate),
      priority: values.priority,
      status: values.status,
    }).then(() => {
      toast("Suggestion converted to action item.", "success");
    }).catch((error) => {
      toast(
        error instanceof Error ? error.message : "Could not convert suggestion.",
        "error",
      );
    });
    setDialog(null);
  };

  return (
    <div className="space-y-4">
      <PhaseMission
        phase="discussion"
        isFacilitator={viewer.isFacilitator}
        aside={
          <Badge variant={actionItems.length > 0 ? "status" : "muted"}>
            {actionItems.length} action item{actionItems.length === 1 ? "" : "s"}
          </Badge>
        }
      />

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
        <Lightbulb className="size-4 shrink-0 text-warning" />
        Aim for 1–3 final action items.
        {actionItems.length === 0 ? (
          <span className="ml-1 font-medium text-foreground">
            None captured yet.
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Discussion queue</h3>
          </div>
          {ranked.length === 0 ? (
            <EmptyState description="No voted topics to discuss. Voting may not have produced results." />
          ) : (
            ranked.map((target, index) => (
              <QueueItem
                key={`${target.type}:${target.id}`}
                target={target}
                rank={index + 1}
                onSuggest={
                  viewer.participantId
                    ? (text) => {
                        const validation = validateActionSuggestion(text);
                        if (!validation.ok) {
                          toast(validation.error, "error");
                          return;
                        }
                        const ctx = getParticipantContext(session.id);
                        if (!ctx) {
                          return;
                        }
                        void api.createActionSuggestion(
                          {
                            sessionId: session.id,
                            participantId: viewer.participantId!,
                            text: text.trim(),
                            sourceCardId: target.type === "card" ? target.id : null,
                            sourceGroupId:
                              target.type === "group" ? target.id : null,
                          },
                          ctx,
                        ).then(() => {
                          toast("Suggestion added.", "success");
                        });
                      }
                    : undefined
                }
                onCreate={
                  viewer.isFacilitator
                    ? () => setDialog({ mode: "create", source: target })
                    : undefined
                }
              />
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-retro-teal" />
              <h3 className="text-sm font-semibold">
                Suggestions ({suggestions.length})
              </h3>
            </div>
            {suggestions.length === 0 ? (
              <EmptyState
                compact
                description="No action suggestions yet. Add one from a discussion topic."
              />
            ) : (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="space-y-2 p-3">
                    <p className="text-sm">{suggestion.text}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Avatar
                          name={participantName(suggestion.participantId)}
                          className="size-5 text-[9px]"
                        />
                        {participantName(suggestion.participantId)}
                      </span>
                      {suggestion.convertedActionItemId ? (
                        <Badge variant="secondary">Converted</Badge>
                      ) : viewer.isFacilitator ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDialog({ mode: "convert", suggestion })
                          }
                        >
                          Convert
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ListPlus className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">
                Final action items ({actionItems.length})
              </h3>
              {viewer.isFacilitator ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialog({ mode: "create" })}
                >
                  <ListPlus />
                  New
                </Button>
              ) : null}
            </div>
            {actionItems.length === 0 ? (
              <EmptyState
                compact
                description="None yet. Convert a suggestion or add one."
              />
            ) : (
              actionItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-1 p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.assignedToName} · {PRIORITY_LABELS[item.priority]}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {viewer.isFacilitator ? (
        <FacilitatorCommandBar
          hint="Capture actions, then finish the retro."
          status={
            <span className="retro-meta">
              {actionItems.length} action item
              {actionItems.length === 1 ? "" : "s"} captured
            </span>
          }
          secondary={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog({ mode: "create" })}
            >
              <ListPlus />
              Add action item
            </Button>
          }
          primary={
            <Button onClick={advance}>
              <CheckCircle2 />
              Finish retro
            </Button>
          }
        />
      ) : null}

      {dialog?.mode === "create" ? (
        <ActionItemDialog
          open
          onClose={() => setDialog(null)}
          title="New action item"
          submitLabel="Create action item"
          ownerOptions={ownerOptions}
          requireOwner
          initial={{
            ...emptyActionForm(),
            title: dialog.source ? dialog.source.title : "",
          }}
          onSubmit={(values) => submitCreate(values, dialog.source)}
        />
      ) : null}

      {dialog?.mode === "convert" ? (
        <ActionItemDialog
          open
          onClose={() => setDialog(null)}
          title="Convert to action item"
          submitLabel="Create action item"
          ownerOptions={ownerOptions}
          requireOwner
          initial={{
            ...emptyActionForm(),
            title: dialog.suggestion.text,
          }}
          onSubmit={(values) => submitConvert(values, dialog.suggestion)}
        />
      ) : null}
    </div>
  );
}

function QueueItem({
  target,
  rank,
  onSuggest,
  onCreate,
}: {
  target: RankedTarget;
  rank: number;
  onSuggest?: (text: string) => void;
  onCreate?: () => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submitSuggestion = () => {
    if (!onSuggest) {
      return;
    }
    const validation = validateActionSuggestion(text);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    onSuggest(text.trim());
    setText("");
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {rank}
            </span>
            <div>
              <p className="text-sm font-medium">{target.title}</p>
              <p className="text-xs text-muted-foreground">
                {target.type === "group" ? "Theme" : "Ungrouped card"} ·{" "}
                {target.votes} vote{target.votes === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          {onCreate ? (
            <Button size="sm" variant="outline" onClick={onCreate}>
              <ListPlus />
              Action
            </Button>
          ) : null}
        </div>

        {target.cards.length > 0 ? (
          <div className="space-y-1.5 pl-10">
            {target.cards.map((card) => (
              <p
                key={card.id}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                {card.text}
              </p>
            ))}
          </div>
        ) : null}

        {onSuggest ? (
          <div className="space-y-2 pl-10">
            <div className="flex gap-2">
              <Input
                placeholder="Suggest an action…"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSuggestion();
                  }
                }}
                className="h-9"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={submitSuggestion}
              >
                <Send />
                Suggest
              </Button>
            </div>
            <InlineValidationMessage message={error} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
