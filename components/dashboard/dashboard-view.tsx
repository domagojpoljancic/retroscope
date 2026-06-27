"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ListChecks,
  PlusCircle,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  EmptyState,
  EmptyStateActionButton,
} from "@/components/ui-state/empty-state";
import { LoadingState } from "@/components/ui-state/loading-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { formatDueDate } from "@/lib/dates";
import { getOpenActionItemsForReview } from "@/lib/action-items";
import { isSupabaseMode } from "@/lib/backend-mode";
import {
  FRAMEWORK_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/labels";
import { getPhaseDefinition } from "@/lib/phases";
import { joinSessionRoute, sessionRoute } from "@/lib/routes";
import { useMockStore } from "@/lib/use-store";
import { MOCK_IDS } from "@/mock/ids";
import type { ActionItem, Session } from "@/types";

const WORKSPACE_ID = MOCK_IDS.workspace;

const PRIORITY_BADGE: Record<string, "default" | "secondary" | "muted"> = {
  high: "default",
  medium: "secondary",
  low: "muted",
};

function isActiveSession(session: Session): boolean {
  return session.status === "draft" || session.status === "active";
}

export function DashboardView() {
  const store = useMockStore();
  const mockMode = !isSupabaseMode();

  if (!store) {
    return <LoadingState />;
  }

  const sessions = store.sessions.filter(
    (session) => session.workspaceId === WORKSPACE_ID,
  );
  const activeSessions = sessions
    .filter(isActiveSession)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pastSessions = sessions
    .filter((session) => !isActiveSession(session))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const openActions = getOpenActionItemsForReview(
    store.actionItems.filter((item) => item.workspaceId === WORKSPACE_ID),
  );

  const participantCount = (sessionId: string) =>
    store.participants.filter((p) => p.sessionId === sessionId).length;

  return (
    <>
      <PageHeader
        eyebrow="Welcome to Retroscope"
        title="Look back. Move forward."
        description="Run a full team retrospective in one place — warm-up, reflection, grouping, voting, discussion, and follow-through."
        actions={
          <>
            <Button asChild>
              <Link href="/sessions/new">
                <PlusCircle />
                New retro
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/actions">
                <ListChecks />
                Action board
              </Link>
            </Button>
          </>
        }
      />

      {mockMode ? (
        <p className="mb-4 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          Running in local demo mode. Data is stored in memory and resets when you refresh.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionHeading
            icon={<CalendarDays className="size-5 text-primary" />}
            title="Active & demo sessions"
            description="Jump back into a live room or explore the demo."
          />
          {activeSessions.length === 0 ? (
            <EmptyState
              title="No retros yet"
              description="Create your first retro and invite your team."
              action={
                <EmptyStateActionButton asChild>
                  <Link href="/sessions/new">
                    <PlusCircle />
                    New retro
                  </Link>
                </EmptyStateActionButton>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  participants={participantCount(session.id)}
                  isDemo={session.id === MOCK_IDS.session}
                />
              ))}
            </div>
          )}

          {pastSessions.length > 0 ? (
            <div className="space-y-4 pt-2">
              <SectionHeading
                icon={<CalendarDays className="size-5 text-muted-foreground" />}
                title="Past sessions"
                description="Completed retros and their summaries."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {pastSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    participants={participantCount(session.id)}
                    isDemo={false}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <SectionHeading
            icon={<ListChecks className="size-5 text-retro-teal" />}
            title="Open action items"
            description="Commitments that still need follow-through."
          />
          <Card>
            <CardContent className="space-y-3 p-4">
              {openActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open action items. Nice work!
                </p>
              ) : (
                openActions.slice(0, 4).map((item) => (
                  <OpenActionRow key={item.id} item={item} />
                ))
              )}
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/actions">
                  Open Action Items Board
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SessionCard({
  session,
  participants,
  isDemo,
}: {
  session: Session;
  participants: number;
  isDemo: boolean;
}) {
  const phase = getPhaseDefinition(session.currentPhase);
  return (
    <Card className="flex flex-col">
      <CardContent className="space-y-3 p-4 pt-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold">{session.name}</h3>
          {isDemo ? <Badge variant="secondary">Demo</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {FRAMEWORK_LABELS[session.frameworkType]} ·{" "}
          {formatDueDate(session.createdAt)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{phase.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {participants} participant{participants === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={sessionRoute(session.id)}>
              Enter session
              <ArrowRight />
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={joinSessionRoute(session.sessionCode)}>Join link</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OpenActionRow({ item }: { item: ActionItem }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3">
      <Avatar name={item.assignedToName} className="size-8" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {item.assignedToName}
          {item.dueDate ? ` · due ${formatDueDate(item.dueDate)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant={PRIORITY_BADGE[item.priority]}>
          {PRIORITY_LABELS[item.priority]}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {STATUS_LABELS[item.status]}
        </span>
      </div>
    </div>
  );
}
