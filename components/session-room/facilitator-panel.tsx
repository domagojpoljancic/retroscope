"use client";

import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

export function FacilitatorPanel({
  children,
  className,
  title = "Facilitator controls",
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/30 bg-primary/5 p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <SlidersHorizontal className="size-3.5" />
        {title}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
