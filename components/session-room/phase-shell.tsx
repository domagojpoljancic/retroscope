"use client";

import { Hourglass } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function PhaseHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function WaitingState({
  title = "Waiting for the facilitator",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Hourglass className="size-6" />
        </span>
        <p className="text-base font-medium">{title}</p>
        {description ? (
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
