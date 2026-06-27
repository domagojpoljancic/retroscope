"use client";

import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoomViewer } from "@/components/session-room/session-room-context";

export function ViewerSwitcher({
  viewers,
  activeKey,
  onChange,
}: {
  viewers: RoomViewer[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Eye className="size-3.5" />
        Dev tools - view as
      </div>
      <div className="flex flex-wrap gap-1.5">
        {viewers.map((viewer) => (
          <button
            key={viewer.key}
            type="button"
            onClick={() => onChange(viewer.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              viewer.key === activeKey
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-background text-muted-foreground hover:bg-secondary",
            )}
          >
            {viewer.label}
            {viewer.isFacilitator ? (
              <span className="ml-1 text-xs opacity-70">(facilitator)</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
