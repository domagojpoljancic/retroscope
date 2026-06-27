import Link from "next/link";
import { ArrowRight, Radio, Sparkles, Vote } from "lucide-react";

import { BrandLens } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_SESSION_CODE, DEMO_SESSION_ID, PRODUCT } from "@/lib/constants";

const WORKFLOW = [
  "Warm up",
  "Write privately",
  "Reveal safely",
  "Group & vote",
  "Decide actions",
  "Track follow-through",
];

const FEATURES = [
  {
    title: "Facilitate with clarity",
    description:
      "Guide teams through warm-ups, reflection, and action planning in one room.",
  },
  {
    title: "Participate with ease",
    description:
      "Join with a code, add notes, and vote on themes without friction.",
  },
  {
    title: "Follow through together",
    description:
      "Carry commitments into a shared action board that outlives the meeting.",
  },
];

export function LandingHero() {
  return (
    <>
      <div className="scope-frame retro-horizon scanlines relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-10 -top-10 size-52 rounded-full bg-retro-violet/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-6 size-40 rounded-full bg-retro-coral/15 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="vhs-label">
              <Radio className="size-3" />
              {PRODUCT.tagline}
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Run retros that actually{" "}
                <span className="bg-[image:var(--retro-gradient)] bg-clip-text text-transparent">
                  move the team forward.
                </span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                Warm up the team, collect private feedback, reveal safely, vote
                on themes, and track action items after the meeting — all in one
                guided flow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/session/${DEMO_SESSION_ID}`}>
                  Open sample session
                </Link>
              </Button>
            </div>
            <dl className="grid max-w-md grid-cols-3 gap-3 pt-2">
              {[
                { value: "1", label: "Room, start to finish" },
                { value: "6", label: "Guided phases" },
                { value: "3", label: "Retro frameworks" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="retro-timer text-2xl font-bold text-foreground">
                    {stat.value}
                  </dt>
                  <dd className="text-xs text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroPreview />
        </div>
      </div>

      <Card className="neon-edge mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">How a Retroscope session flows</CardTitle>
          <CardDescription>
            One guided path from check-in to follow-through.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="flex flex-wrap items-center gap-2">
            {WORKFLOW.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium">
                  <span className="retro-meta text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step}
                </span>
                {index < WORKFLOW.length - 1 ? (
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                ) : null}
              </li>
            ))}
          </ol>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-background/70 p-4"
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  {item.title}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border/70 pt-5">
            <Button variant="secondary" asChild>
              <Link href="/login">Facilitator login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/join/${DEMO_SESSION_CODE}`}>Join with code</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/actions">Action board</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function HeroPreview() {
  return (
    <div className="scope-frame time-scan relative overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLens size="sm" />
          <span className="retro-meta">Sprint 25 · Live</span>
        </div>
        <span className="retro-timer rounded-md bg-foreground px-2 py-0.5 text-xs font-semibold text-background">
          04:32
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {["Warm-up", "Writing", "Reveal", "Vote", "Actions"].map((phase, i) => (
          <span
            key={phase}
            className={
              i === 1
                ? "rounded-full bg-[image:var(--retro-gradient)] px-2.5 py-1 text-[11px] font-medium text-white"
                : "rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
            }
          >
            {phase}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <PreviewColumn label="Start" tone="teal" filled={2} />
        <PreviewColumn label="Stop" tone="coral" filled={1} />
        <PreviewColumn label="Continue" tone="violet" filled={2} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Vote className="size-3.5 text-primary" />
          5 votes left
        </span>
        <span className="retro-meta">3 themes</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-1">
        {["Write", "Reveal", "Vote", "Action"].map((step, i) => (
          <span key={step} className="flex items-center gap-1">
            <span className="retro-meta text-[10px] text-foreground">{step}</span>
            {i < 3 ? (
              <ArrowRight className="size-3 text-muted-foreground/60" />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewColumn({
  label,
  tone,
  filled,
}: {
  label: string;
  tone: "teal" | "coral" | "violet";
  filled: number;
}) {
  const toneClass =
    tone === "teal"
      ? "border-l-retro-teal"
      : tone === "coral"
        ? "border-l-retro-coral"
        : "border-l-retro-violet";
  return (
    <div className="space-y-1.5">
      <p className="retro-meta text-[10px]">{label}</p>
      {[0, 1].map((i) => (
        <div
          key={i}
          className={`h-7 rounded-md border border-l-2 ${toneClass} ${
            i < filled ? "bg-background" : "redacted bg-muted/60"
          }`}
        />
      ))}
    </div>
  );
}
