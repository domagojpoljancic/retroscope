"use client";

import { EyeOff, Lock, Radio } from "lucide-react";

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
  const ownUnrevealed = !card.isRevealed && viewerIsOwner;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      onKeyDown={
        selectable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-pressed={selectable ? Boolean(selected) : undefined}
      className={cn(
        "group relative rounded-xl border bg-card p-3 shadow-sm transition-all",
        selectable && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-primary ring-2 ring-primary/40"
          : "border-border",
        hidden && "redacted border-dashed bg-secondary/25",
        ownUnrevealed && "border-dashed border-primary/40 bg-primary/[0.06]",
        locked && card.isRevealed && "bg-muted/30",
        !!voteCount && voteCount > 0 && "ring-1 ring-retro-coral/30",
      )}
      style={
        accentColor
          ? { borderLeftColor: accentColor, borderLeftWidth: 3 }
          : undefined
      }
    >
      {hidden ? (
        <div className="relative flex items-center gap-2 py-1 text-sm">
          <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Lock className="size-3.5" />
          </span>
          <span className="flex-1 select-none space-y-1.5">
            <span className="block h-2 w-4/5 rounded bg-muted-foreground/25" />
            <span className="block h-2 w-3/5 rounded bg-muted-foreground/20" />
          </span>
          <span className="retro-meta text-[9px] text-muted-foreground/70">
            Hidden
          </span>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-foreground">{card.text}</p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {!hidden ? (
            authorName === null ? (
              <span className="retro-meta text-[10px]">Anonymous</span>
            ) : authorName ? (
              <span>{authorName}</span>
            ) : null
          ) : null}
          {ownUnrevealed ? (
            <span className="flex items-center gap-1 font-medium text-primary">
              <EyeOff className="size-3" />
              Only you
            </span>
          ) : null}
          {locked && card.isRevealed ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Radio className="size-3" />
              Locked
            </span>
          ) : null}
        </span>
        {typeof voteCount === "number" && voteCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-retro-coral/15 px-2 py-0.5 text-xs font-semibold text-retro-coral">
            {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </span>
        ) : null}
      </div>

      {children ? (
        <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
      ) : null}
    </div>
  );
}
