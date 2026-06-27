"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, PartyPopper } from "lucide-react";

import { getAuthContextAction } from "@/app/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { SuccessState } from "@/components/ui-state/success-state";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { absoluteUrl } from "@/lib/clipboard";
import { getFrameworkColumns } from "@/lib/framework-columns";
import {
  FRAMEWORK_LABELS,
  FRAMEWORK_OPTIONS,
  WARMUP_LABELS,
  WARMUP_OPTIONS,
} from "@/lib/labels";
import { joinSessionRoute, sessionRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { validateSessionCreate } from "@/lib/validation";
import { facilitatorProfile, mockProfiles } from "@/mock/profiles";
import { MOCK_IDS } from "@/mock/ids";
import { isSupabaseMode } from "@/lib/backend-mode";
import type {
  FrameworkType,
  GroupingPermission,
  Session,
  WarmupType,
} from "@/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateSessionCode(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

const SEED_PARTICIPANTS = mockProfiles.filter(
  (profile) => profile.id !== facilitatorProfile.id,
);

type FieldErrors = {
  name?: string;
  form?: string;
};

export function SessionCreateForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [warmupType, setWarmupType] = useState<WarmupType>("mood_character");
  const [frameworkType, setFrameworkType] =
    useState<FrameworkType>("start_stop_continue");
  const [anonymousCards, setAnonymousCards] = useState(true);
  const [facilitatorParticipates, setFacilitatorParticipates] = useState(true);
  const [groupingPermission, setGroupingPermission] =
    useState<GroupingPermission>("facilitator_only");
  const [created, setCreated] = useState<Session | null>(null);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleCreate = async () => {
    const validation = validateSessionCreate({
      name,
      warmupType,
      frameworkType,
      groupingPermission,
    });
    if (!validation.ok) {
      if (validation.error.includes("Session name")) {
        setErrors({ name: validation.error });
      } else {
        setErrors({ form: validation.error });
      }
      return;
    }

    setCreating(true);
    setErrors({});
    try {
      let workspaceId: string = MOCK_IDS.workspace;
      let createdByUserId = facilitatorProfile.id;

      if (isSupabaseMode()) {
        const authResult = await getAuthContextAction();
        if (!authResult.ok || !authResult.data) {
          setErrors({ form: "Sign in as a facilitator before creating a session." });
          return;
        }
        workspaceId = authResult.data.workspace.id;
        createdByUserId = authResult.data.userId;
      }

      const session = await api.createSession({
        workspaceId,
        createdByUserId,
        name: name.trim(),
        sessionCode: generateSessionCode(),
        warmupType,
        frameworkType,
        anonymousCards,
        facilitatorParticipates,
        groupingPermission,
      });

      if (facilitatorParticipates) {
        await api.joinSession({
          sessionId: session.id,
          displayName: facilitatorProfile.displayName,
          userId: createdByUserId,
          isFacilitatorParticipant: true,
        });
      }

      if (!isSupabaseMode()) {
        for (const profile of SEED_PARTICIPANTS) {
          await api.joinSession({
            sessionId: session.id,
            displayName: profile.displayName,
            userId: profile.id,
            isFacilitatorParticipant: false,
          });
        }
      }

      setCreated(session);
      toast("Session created. Share the join link with your team.", "success");
    } catch (createError) {
      setErrors({
        form:
          createError instanceof Error
            ? createError.message
            : "Failed to create session",
      });
    } finally {
      setCreating(false);
    }
  };

  if (created) {
    const joinUrl = absoluteUrl(joinSessionRoute(created.sessionCode));
    return (
      <>
        <PageHeader
          eyebrow="Facilitator"
          title="Session ready"
          description="Share the join link with your team, then step into the session room to begin."
        />
        <SuccessState title="Your retro session is ready">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PartyPopper className="size-5 text-primary" />
                {created.name}
              </CardTitle>
              <CardDescription>
                {FRAMEWORK_LABELS[created.frameworkType]} ·{" "}
                {WARMUP_LABELS[created.warmupType]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Session code</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-xl bg-secondary px-4 py-2 font-mono text-xl font-semibold tracking-[0.3em] text-secondary-foreground">
                    {created.sessionCode}
                  </span>
                  <CopyButton value={created.sessionCode} label="Copy code" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Participant join link</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Input readOnly value={joinUrl} className="max-w-md font-mono text-xs" />
                  <CopyButton value={joinUrl} label="Copy link" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={() => router.push(sessionRoute(created.id))}>
                  Enter session room
                  <ArrowRight />
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </SuccessState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Facilitator"
        title="Create a retro session"
        description="Set the name, warm-up, framework, and team permissions before inviting participants."
      />

      <div className="space-y-6">
        {errors.form ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errors.form}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session basics</CardTitle>
            <CardDescription>Give your retrospective a clear name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="session-name">Session name</Label>
            <Input
              id="session-name"
              placeholder="e.g. Sprint 25 Retro"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.name)}
            />
            <InlineValidationMessage message={errors.name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Warm-up</CardTitle>
            <CardDescription>
              Pick a light activity to help the team settle in.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {WARMUP_OPTIONS.map((option) => (
              <OptionTile
                key={option}
                selected={warmupType === option}
                onClick={() => setWarmupType(option)}
                title={WARMUP_LABELS[option]}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retro framework</CardTitle>
            <CardDescription>
              This sets the board columns for reflection.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {FRAMEWORK_OPTIONS.map((option) => (
              <OptionTile
                key={option}
                selected={frameworkType === option}
                onClick={() => setFrameworkType(option)}
                title={FRAMEWORK_LABELS[option]}
                subtitle={getFrameworkColumns(option)
                  .map((column) => column.label)
                  .join(" · ")}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team settings</CardTitle>
            <CardDescription>
              Control anonymity, facilitator participation, and grouping.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ToggleRow
              id="anonymous-cards"
              title="Anonymous cards"
              description="Hide author names on retro cards."
              checked={anonymousCards}
              onChange={setAnonymousCards}
            />
            <ToggleRow
              id="facilitator-participates"
              title="Facilitator participates"
              description="The facilitator can also write and vote."
              checked={facilitatorParticipates}
              onChange={setFacilitatorParticipates}
            />

            <div className="space-y-2">
              <Label>Grouping permission</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionTile
                  selected={groupingPermission === "facilitator_only"}
                  onClick={() => setGroupingPermission("facilitator_only")}
                  title="Facilitator only"
                  subtitle="Default — only the facilitator groups cards."
                />
                <OptionTile
                  selected={groupingPermission === "participants_allowed"}
                  onClick={() => setGroupingPermission("participants_allowed")}
                  title="Participants can group"
                  subtitle="Everyone can create and edit groups."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button size="lg" disabled={creating} onClick={() => void handleCreate()}>
            {creating ? "Creating…" : "Create session"}
            <ArrowRight />
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function OptionTile({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-background hover:bg-accent/40",
      )}
    >
      <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold">
        {title}
        {selected ? <Check className="size-4 text-primary" /> : null}
      </span>
      {subtitle ? (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      ) : null}
    </button>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
