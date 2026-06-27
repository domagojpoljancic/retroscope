"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui-state/error-state";
import { LoadingState } from "@/components/ui-state/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DiscussionPhase } from "@/components/session-room/phases/discussion-phase";
import { LobbyPhase } from "@/components/session-room/phases/lobby-phase";
import { PreviousActionReviewPhase } from "@/components/session-room/phases/previous-action-review-phase";
import { RevealGroupPhase } from "@/components/session-room/phases/reveal-group-phase";
import { SummaryPhase } from "@/components/session-room/phases/summary-phase";
import { VotingPhase } from "@/components/session-room/phases/voting-phase";
import { VotingSetupPhase } from "@/components/session-room/phases/voting-setup-phase";
import { WarmupPhase } from "@/components/session-room/phases/warmup-phase";
import { WritingPhase } from "@/components/session-room/phases/writing-phase";
import { WritingSetupPhase } from "@/components/session-room/phases/writing-setup-phase";
import { ParticipantStrip } from "@/components/session-room/participant-strip";
import { PhaseNav } from "@/components/session-room/phase-nav";
import {
  SessionRoomProvider,
  snapshotToStoreView,
  type RoomViewer,
  type SessionRoomContextValue,
} from "@/components/session-room/session-room-context";
import { SessionTopBar } from "@/components/session-room/top-bar";
import { ViewerSwitcher } from "@/components/session-room/viewer-switcher";
import { api } from "@/lib/api";
import { nowIso } from "@/lib/dates";
import { getFrameworkColumns } from "@/lib/framework-columns";
import { getOpenActionItemsForReview } from "@/lib/action-items";
import {
  getNextPhaseInFlow,
  getPreviousPhaseInFlow,
} from "@/lib/session-flow";
import { buildSessionViewers } from "@/lib/session-viewers";
import { useSessionData } from "@/lib/use-session-data";
import type { SessionPhase } from "@/types";

type SessionRoomProps = {
  sessionId: string;
};

export function SessionRoom({ sessionId }: SessionRoomProps) {
  const snapshot = useSessionData(sessionId);
  const [viewerKey, setViewerKey] = useState("facilitator");

  const session = snapshot?.session ?? null;
  const participants = snapshot?.participants ?? [];

  const viewers = useMemo<RoomViewer[]>(
    () => (session ? buildSessionViewers(session, participants) : []),
    [session, participants],
  );

  if (snapshot === undefined) {
    return <LoadingState variant="card" label="Loading session room…" />;
  }

  if (!session || !snapshot) {
    return (
      <>
        <PageHeader
          eyebrow="Live session"
          title="Session not found"
          description="This session doesn't exist. It may have been created in another browser."
        />
        <ErrorState
          title="Can't open this session"
          description="Create a new session or return to the dashboard."
          actions={
            <>
              <Button asChild>
                <Link href="/sessions/new">New session</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          }
        />
      </>
    );
  }

  const store = snapshotToStoreView(snapshot);

  const hasActionReview =
    getOpenActionItemsForReview(
      snapshot.actionItems.filter(
        (item) => item.workspaceId === session.workspaceId,
      ),
    ).length > 0;

  const activeViewer =
    viewers.find((viewer) => viewer.key === viewerKey) ?? viewers[0];

  const goToPhase = (phase: SessionPhase) => {
    const updates: Parameters<typeof api.updateSession>[1] = {
      currentPhase: phase,
    };
    if (phase !== "lobby" && session.status === "draft") {
      updates.status = "active";
      updates.startedAt = session.startedAt ?? nowIso();
    }
    if (phase === "summary") {
      updates.status = "completed";
      updates.endedAt = nowIso();
    }
    void api.updateSession(session.id, updates);
  };

  const advance = () => {
    const next = getNextPhaseInFlow(session.currentPhase, hasActionReview);
    if (next) {
      goToPhase(next);
    }
  };

  const back = () => {
    const previous = getPreviousPhaseInFlow(
      session.currentPhase,
      hasActionReview,
    );
    if (previous) {
      goToPhase(previous);
    }
  };

  const participantName = (participantId: string | null) => {
    if (!participantId) {
      return "Unknown";
    }
    return (
      participants.find((p) => p.id === participantId)?.displayName ?? "Unknown"
    );
  };

  const contextValue: SessionRoomContextValue = {
    session,
    store,
    participants,
    columns: getFrameworkColumns(session.frameworkType),
    viewer: activeViewer,
    hasActionReview,
    goToPhase,
    advance,
    back,
    participantName,
  };

  return (
    <SessionRoomProvider value={contextValue}>
      <div className="space-y-4">
        <SessionTopBar />
        <ViewerSwitcher
          viewers={viewers}
          activeKey={activeViewer.key}
          onChange={setViewerKey}
        />
        <PhaseNav />
        <Card>
          <CardContent className="p-4">
            <ParticipantStrip />
          </CardContent>
        </Card>

        <PhaseContent phase={session.currentPhase} />
      </div>
    </SessionRoomProvider>
  );
}

function PhaseContent({ phase }: { phase: SessionPhase }) {
  switch (phase) {
    case "lobby":
      return <LobbyPhase />;
    case "warmup":
      return <WarmupPhase />;
    case "previous_action_review":
      return <PreviousActionReviewPhase />;
    case "writing_setup":
      return <WritingSetupPhase />;
    case "writing":
      return <WritingPhase />;
    case "reveal_group":
      return <RevealGroupPhase />;
    case "voting_setup":
      return <VotingSetupPhase />;
    case "voting":
      return <VotingPhase />;
    case "discussion":
      return <DiscussionPhase />;
    case "summary":
      return <SummaryPhase />;
    default:
      return null;
  }
}
