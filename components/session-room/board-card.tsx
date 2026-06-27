"use client";

import { EyeOff, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RetroCard } from "@/types";

type BoardCardProps = {
  card: RetroCard;
  viewerIsOwner: boolean;
  /** Author name to show, or null when the session is anonymous. */
  authorName?: string | null;
  accentColor?: string;
  voteCount?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** When true, card is revealed and locked from editing. */
  locked?: boolean;
  /** Action row rendered at the bottom (e.g. reveal/edit/delete buttons). */
  children?: React.ReactNode;
};

export function BoardCard({
  card,
  viewerIsOwner,
  authorName,
  accentColor,
  voteCount,
  selectable,
  selected,
  onSelect,
  locked = false,
  children,
}: BoardCardProps) {
  const hidden = !card.isRevealed && !viewerIsOwner;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "rounded-xl border bg-background p-3 shadow-sm transition-colors",
        selectable && "cursor-pointer hover:border-primary/60",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
        !card.isRevealed && "border-dashed",
        locked && card.isRevealed && "bg-muted/30",
      )}
      style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : undefined}
    >
      {hidden ? (
        <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
          <Lock className="size-3.5 shrink-0" />
          <span className="flex-1 select-none space-y-1">
            <span className="block h-2 w-4/5 rounded bg-muted-foreground/25" />
            <span className="block h-2 w-3/5 rounded bg-muted-foreground/20" />
          </span>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-foreground">{card.text}</p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {!hidden ? (
            authorName === null ? (
              <span>Anonymous</span>
            ) : authorName ? (
              <span>{authorName}</span>
            ) : null
          ) : null}
          {!card.isRevealed && viewerIsOwner ? (
            <span className="flex items-center gap-1 text-amber-600">
              <EyeOff className="size-3" />
              Only you can see this
            </span>
          ) : null}
          {locked && card.isRevealed ? (
            <span className="flex items-center gap-1">
              <Lock className="size-3" />
              Revealed — locked
            </span>
          ) : null}
        </span>
        {typeof voteCount === "number" && voteCount > 0 ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </span>
        ) : null}
      </div>

      {children ? <div className="mt-2 flex flex-wrap gap-1.5">{children}</div> : null}
    </div>
  );
}
