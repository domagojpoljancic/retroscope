"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleDot, Forward } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { PhaseHeading } from "@/components/session-room/phase-shell";
import { useRoom } from "@/components/session-room/session-room-context";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDueDate } from "@/lib/dates";
import { getOpenActionItemsForReview } from "@/lib/action-items";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { api } from "@/lib/api";
import type { ActionItem } from "@/types";

const PRIORITY_BADGE: Record<string, "default" | "secondary" | "muted"> = {
  high: "default",
  medium: "secondary",
  low: "muted",
};

export function PreviousActionReviewPhase() {
  const { session, store, viewer, advance } = useRoom();
  const { toast } = useToast();
  const [carried, setCarried] = useState<Record<string, boolean>>({});

  const items = getOpenActionItemsForReview(
    store.actionItems.filter(
      (item) => item.workspaceId === session.workspaceId,
    ),
  );

  const updateStatus = async (itemId: string, status: ActionItem["status"]) => {
    try {
      await api.updateActionItem(itemId, { status });
      toast("Action item updated.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not update action item.",
        "error",
      );
    }
  };

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Previous action review"
        description="Check in on open commitments from earlier retros before reflecting on this sprint."
      />

      <div className="space-y-3">
        {items.map((item) => (
          <ActionReviewRow
            key={item.id}
            item={item}
            canEdit={viewer.isFacilitator}
            carried={Boolean(carried[item.id])}
            onCarry={() => {
              setCarried((prev) => ({ ...prev, [item.id]: true }));
              toast("Marked to carry into this retro.", "success");
            }}
            onUpdateStatus={updateStatus}
          />
        ))}
      </div>

      {viewer.isFacilitator ? (
        <FacilitatorPanel title="Move on">
          <Button onClick={advance}>
            Continue to writing
            <ArrowRight />
          </Button>
        </FacilitatorPanel>
      ) : null}
    </div>
  );
}

function ActionReviewRow({
  item,
  canEdit,
  carried,
  onCarry,
  onUpdateStatus,
}: {
  item: ActionItem;
  canEdit: boolean;
  carried: boolean;
  onCarry: () => void;
  onUpdateStatus: (itemId: string, status: ActionItem["status"]) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="font-medium">{item.title}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Avatar name={item.assignedToName} className="size-5 text-[9px]" />
              {item.assignedToName}
            </span>
            <Badge variant={PRIORITY_BADGE[item.priority]}>
              {PRIORITY_LABELS[item.priority]}
            </Badge>
            <Badge variant="muted">{STATUS_LABELS[item.status]}</Badge>
            {item.dueDate ? <span>Due {formatDueDate(item.dueDate)}</span> : null}
            {carried ? (
              <Badge variant="secondary">Carried into this retro</Badge>
            ) : null}
          </div>
        </div>

        {canEdit ? (
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={item.status === "in_progress" ? "secondary" : "outline"}
              onClick={() => void onUpdateStatus(item.id, "in_progress")}
            >
              <CircleDot />
              In progress
            </Button>
            <Button
              size="sm"
              variant={item.status === "done" ? "secondary" : "outline"}
              onClick={() => void onUpdateStatus(item.id, "done")}
            >
              <Check />
              Done
            </Button>
            <Button size="sm" variant="outline" onClick={onCarry}>
              <Forward />
              Carry forward
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
