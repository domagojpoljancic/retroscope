"use client";

import Link from "next/link";
import {
  CalendarDays,
  ListChecks,
  Trophy,
  Users,
} from "lucide-react";

import { ErrorState } from "@/components/ui-state/error-state";
import { EmptyState } from "@/components/ui-state/empty-state";
import { LoadingState } from "@/components/ui-state/loading-state";
import { PermissionHint } from "@/components/ui-state/permission-hint";
import { useToast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDueDate } from "@/lib/dates";
import { FRAMEWORK_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { buildRankedTargets } from "@/lib/session-results";
import { useMockStore } from "@/lib/use-store";
import type { MockDataState } from "@/mock";
import type { Session } from "@/types";

function buildSummaryText(store: MockDataState, session: Session): string {
  const participants = store.participants.filter(
    (p) => p.sessionId === session.id,
  );
  const cards = store.cards.filter(
    (c) => c.sessionId === session.id && c.deletedAt === null,
  );
  const groups = store.groups.filter(
    (g) => g.sessionId === session.id && g.deletedAt === null,
  );
  const votes = store.votes.filter((v) => v.sessionId === session.id);
  const ranked = buildRankedTargets(cards, groups, votes).slice(0, 5);
  const actions = store.actionItems.filter(
    (item) => item.sourceSessionId === session.id && item.deletedAt === null,
  );

  const lines: string[] = [];
  lines.push(`${session.name} — Retro summary`);
  lines.push(`Framework: ${FRAMEWORK_LABELS[session.frameworkType]}`);
  lines.push(`Participants: ${participants.map((p) => p.displayName).join(", ")}`);
  lines.push("");
  lines.push("Top topics:");
  ranked.forEach((target, index) => {
    lines.push(`  ${index + 1}. ${target.title} (${target.votes} votes)`);
  });
  lines.push("");
  lines.push("Action items:");
  if (actions.length === 0) {
    lines.push("  (none)");
  } else {
    actions.forEach((item) => {
      const due = item.dueDate ? `, due ${formatDueDate(item.dueDate)}` : "";
      lines.push(`  - ${item.title} — ${item.assignedToName}${due}`);
    });
  }
  return lines.join("\n");
}

export function SummaryView({ sessionId }: { sessionId: string }) {
  const store = useMockStore();
  const { toast } = useToast();

  if (!store) {
    return <LoadingState variant="card" label="Loading summary…" />;
  }

  const session = store.sessions.find((item) => item.id === sessionId);
  if (!session) {
    return (
      <ErrorState
        title="Session not found"
        description="This summary is no longer available."
      />
    );
  }

  const participants = store.participants.filter(
    (p) => p.sessionId === session.id,
  );
  const cards = store.cards.filter(
    (c) => c.sessionId === session.id && c.deletedAt === null,
  );
  const groups = store.groups.filter(
    (g) => g.sessionId === session.id && g.deletedAt === null,
  );
  const votes = store.votes.filter((v) => v.sessionId === session.id);
  const ranked = buildRankedTargets(cards, groups, votes)
    .filter((target) => target.votes > 0)
    .slice(0, 5);
  const actions = store.actionItems.filter(
    (item) => item.sourceSessionId === session.id && item.deletedAt === null,
  );

  const dateLabel = formatDueDate(session.endedAt ?? session.createdAt);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{session.name}</CardTitle>
            <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {dateLabel}
              </span>
              <Badge variant="muted">
                {FRAMEWORK_LABELS[session.frameworkType]}
              </Badge>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              value={buildSummaryText(store, session)}
              label="Copy summary"
              onCopied={() => toast("Summary copied.", "success")}
            />
            <Button asChild>
              <Link href="/actions">
                <ListChecks />
                Action board
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Users className="size-4 text-primary" />
              Participants ({participants.length})
            </p>
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No participants recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-background py-1 pl-1 pr-3"
                  >
                    <Avatar name={p.displayName} className="size-6 text-[10px]" />
                    <span className="text-xs font-medium">{p.displayName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {actions.length === 0 ? (
        <PermissionHint message="No final action items were captured. Follow up on the action board." />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-amber-500" />
              Top-voted topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ranked.length === 0 ? (
              <EmptyState compact description="No votes recorded." />
            ) : (
              ranked.map((target, index) => (
                <div
                  key={`${target.type}:${target.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {index + 1}
                    </span>
                    {target.title}
                  </span>
                  <Badge variant="secondary">
                    {target.votes} vote{target.votes === 1 ? "" : "s"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="size-5 text-retro-teal" />
              Final action items ({actions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {actions.length === 0 ? (
              <EmptyState compact description="No action items captured." />
            ) : (
              actions.map((item) => (
                <div
                  key={item.id}
                  className="space-y-1 rounded-xl border border-border bg-background p-3"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Avatar
                        name={item.assignedToName}
                        className="size-5 text-[9px]"
                      />
                      {item.assignedToName}
                    </span>
                    <Badge variant="muted">{PRIORITY_LABELS[item.priority]}</Badge>
                    <Badge variant="muted">{STATUS_LABELS[item.status]}</Badge>
                    {item.dueDate ? (
                      <span>Due {formatDueDate(item.dueDate)}</span>
                    ) : null}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
