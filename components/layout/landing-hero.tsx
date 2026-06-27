import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_SESSION_CODE, DEMO_SESSION_ID, PRODUCT } from "@/lib/constants";

export function LandingHero() {
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 size-32 rounded-full bg-retro-coral/10 blur-3xl" />

        <PageHeader
          eyebrow="Retrospectives, reimagined"
          title={`${PRODUCT.name}. ${PRODUCT.tagline}`}
          description={PRODUCT.description}
          actions={
            <>
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/session/${DEMO_SESSION_ID}`}>Try demo session</Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Facilitate with clarity",
              description:
                "Guide teams through warm-ups, reflection, and action planning in one workspace.",
            },
            {
              title: "Participate with ease",
              description:
                "Join with a code, add notes, vote on themes, and stay engaged without friction.",
            },
            {
              title: "Follow through together",
              description:
                "Carry commitments into a shared action board that outlives the meeting.",
            },
          ].map((item) => (
            <Card key={item.title} className="bg-background/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-primary" />
                  {item.title}
                </CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Foundation preview</CardTitle>
          <CardDescription>
            This MVP scaffold includes route shells, shared layout, and product
            copy. Realtime session logic arrives in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" asChild>
            <Link href="/login">Facilitator login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/join/${DEMO_SESSION_CODE}`}>Join with code</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/actions">Action board</Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
