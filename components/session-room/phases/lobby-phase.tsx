"use client";

import { Play, SkipForward } from "lucide-react";

import { FacilitatorPanel } from "@/components/session-room/facilitator-panel";
import { PhaseHeading, WaitingState } from "@/components/session-room/phase-shell";
import { useRoom } from "@/components/session-room/session-room-context";
import { EmptyState } from "@/components/ui-state/empty-state";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { absoluteUrl } from "@/lib/clipboard";
import {
  FRAMEWORK_LABELS,
  GROUPING_PERMISSION_LABELS,
  WARMUP_LABELS,
} from "@/lib/labels";
import { getNextPhaseInFlow } from "@/lib/session-flow";
import { joinSessionRoute } from "@/lib/routes";

export function LobbyPhase() {
  const { session, viewer, participants, hasActionReview, goToPhase } = useRoom();
  const { toast } = useToast();
  const joinUrl = absoluteUrl(joinSessionRoute(session.sessionCode));

  const afterWarmup = getNextPhaseInFlow("warmup", hasActionReview) ?? "writing_setup";

  const summary = [
    { label: "Framework", value: FRAMEWORK_LABELS[session.frameworkType] },
    { label: "Warm-up", value: WARMUP_LABELS[session.warmupType] },
    {
      label: "Cards",
      value: session.anonymousCards ? "Anonymous" : "Names shown",
    },
    {
      label: "Facilitator",
      value: session.facilitatorParticipates ? "Participating" : "Observing",
    },
    {
      label: "Grouping",
      value: GROUPING_PERMISSION_LABELS[session.groupingPermission],
    },
  ];

  const onCopied = () => toast("Copied to clipboard.", "success");

  return (
    <div className="space-y-4">
      <PhaseHeading
        title="Lobby"
        description="Participants are joining. Review the setup, then start the retro when the team is ready."
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-background p-3"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium">Invite your team</p>
            <p className="text-xs text-muted-foreground">
              Share code{" "}
              <span className="font-mono font-semibold">
                {session.sessionCode}
              </span>{" "}
              or the join link.
            </p>
          </div>
          <div className="flex gap-2">
            <CopyButton
              value={session.sessionCode}
              label="Copy code"
              onCopied={onCopied}
            />
            <CopyButton
              value={joinUrl}
              label="Copy invite link"
              onCopied={onCopied}
            />
          </div>
        </CardContent>
      </Card>

      {participants.length === 0 ? (
        <EmptyState
          compact
          description="No participants yet. Share the join link to get started."
        />
      ) : null}

      {viewer.isFacilitator ? (
        <FacilitatorPanel>
          <CopyButton
            value={joinUrl}
            label="Copy invite link"
            variant="outline"
            onCopied={onCopied}
          />
          <Button onClick={() => goToPhase("warmup")}>
            <Play />
            Start warm-up
          </Button>
          <Button variant="secondary" onClick={() => goToPhase(afterWarmup)}>
            <SkipForward />
            Skip warm-up
          </Button>
        </FacilitatorPanel>
      ) : (
        <WaitingState description="The facilitator will start the session shortly." />
      )}
    </div>
  );
}
