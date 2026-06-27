"use client";

import { useEffect, useReducer, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, UserRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui-state/error-state";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { LoadingState } from "@/components/ui-state/loading-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import {
  clearIdentity,
  getStoredIdentity,
  storeIdentity,
  type ParticipantIdentity,
} from "@/lib/identity";
import { FRAMEWORK_LABELS, WARMUP_LABELS } from "@/lib/labels";
import { sessionRoute } from "@/lib/routes";
import { useSessionData } from "@/lib/use-session-data";
import { validateDisplayName } from "@/lib/validation";
import type { Session } from "@/types";

type JoinFormProps = {
  sessionCode: string;
};

function isValidSessionCode(code: string): boolean {
  return /^[A-Za-z0-9]{4,8}$/.test(code.trim());
}

export function JoinForm({ sessionCode }: JoinFormProps) {
  const router = useRouter();
  const invalidCode = !isValidSessionCode(sessionCode);
  // Invalid codes resolve to "not found" immediately, so we never enter the
  // loading state for them.
  const [session, setSession] = useState<Session | null | undefined>(
    invalidCode ? null : undefined,
  );
  const [loading, setLoading] = useState(!invalidCode);
  const [joining, setJoining] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const snapshot = useSessionData(session?.id ?? "");
  const participantCount = snapshot?.participants.length ?? 0;

  useEffect(() => {
    if (invalidCode) {
      return;
    }

    let cancelled = false;
    void api.getSessionByCode(sessionCode).then((result) => {
      if (!cancelled) {
        setSession(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionCode, invalidCode]);

  const [displayName, setDisplayName] = useState("");
  const [, refreshIdentity] = useReducer((value: number) => value + 1, 0);

  const identity: ParticipantIdentity | null = session
    ? getStoredIdentity(session.id)
    : null;

  if (loading || session === undefined) {
    return <LoadingState variant="card" label="Loading session…" />;
  }

  if (invalidCode || !session) {
    return (
      <>
        <PageHeader
          eyebrow="Participant"
          title="Session not found"
          description={
            invalidCode
              ? "This join link looks invalid. Ask your facilitator for a fresh link."
              : `We couldn't find a session with code "${sessionCode.toUpperCase()}".`
          }
        />
        <ErrorState
          title="Can't join this session"
          description="Double-check the code or link with your facilitator."
          actions={
            <Button variant="outline" asChild>
              <Link href="/">Go home</Link>
            </Button>
          }
        />
      </>
    );
  }

  if (session.status === "completed" || session.status === "archived") {
    return (
      <>
        <PageHeader
          eyebrow="Participant"
          title="Session already completed"
          description={`${session.name} has ended. You can review the summary if you were part of the retro.`}
          badge={session.sessionCode}
        />
        <ErrorState
          title="This retro is finished"
          description="New participants can't join a completed session."
          actions={
            <>
              <Button asChild>
                <Link href={sessionRoute(session.id)}>View session</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Go home</Link>
              </Button>
            </>
          }
        />
      </>
    );
  }

  const handleJoin = async () => {
    const validation = validateDisplayName(displayName);
    if (!validation.ok) {
      setNameError(validation.error);
      return;
    }

    setNameError(null);
    setJoinError(null);
    setJoining(true);
    try {
      const participant = await api.joinSession({
        sessionId: session.id,
        displayName: displayName.trim(),
      });
      const nextIdentity: ParticipantIdentity = {
        participantId: participant.id,
        participantToken: participant.participantToken,
        displayName: participant.displayName,
      };
      storeIdentity(session.id, nextIdentity);
      router.push(sessionRoute(session.id));
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Could not join session.",
      );
    } finally {
      setJoining(false);
    }
  };

  const handleRejoin = () => {
    clearIdentity(session.id);
    refreshIdentity();
  };

  const resolvedParticipantCount =
    snapshot && snapshot.session.id === session.id
      ? snapshot.participants.length
      : participantCount;

  return (
    <>
      <PageHeader
        eyebrow="Participant"
        title="Join the retrospective"
        description="Enter your display name to step into the live session room."
        badge={session.sessionCode}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="size-5 text-primary" />
              Who are you?
            </CardTitle>
            <CardDescription>
              Pick any name — duplicates are welcome.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {identity ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <Avatar name={identity.displayName} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Welcome back</p>
                    <p className="truncate text-sm text-muted-foreground">
                      Rejoining as {identity.displayName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => router.push(sessionRoute(session.id))}>
                    <LogIn />
                    Continue
                  </Button>
                  <Button variant="outline" onClick={handleRejoin}>
                    Join as someone else
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display name</Label>
                  <Input
                    id="display-name"
                    placeholder="e.g. Jordan"
                    value={displayName}
                    autoFocus
                    onChange={(event) => {
                      setDisplayName(event.target.value);
                      if (nameError) {
                        setNameError(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleJoin();
                      }
                    }}
                    aria-invalid={Boolean(nameError)}
                    disabled={joining}
                  />
                  <InlineValidationMessage message={nameError} />
                  <InlineValidationMessage message={joinError} />
                </div>
                <Button
                  onClick={() => void handleJoin()}
                  disabled={joining}
                >
                  {joining ? "Joining…" : "Join session"}
                  <ArrowRight />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{session.name}</CardTitle>
            <CardDescription>What to expect in this retro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow label="Framework">
              {FRAMEWORK_LABELS[session.frameworkType]}
            </DetailRow>
            <DetailRow label="Warm-up">
              {WARMUP_LABELS[session.warmupType]}
            </DetailRow>
            <DetailRow label="Cards">
              <Badge variant="muted">
                {session.anonymousCards ? "Anonymous" : "Names shown"}
              </Badge>
            </DetailRow>
            <DetailRow label="Participants">{resolvedParticipantCount}</DetailRow>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
