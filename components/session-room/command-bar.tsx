"use client";

import { cn } from "@/lib/utils";

type FacilitatorCommandBarProps = {
  /** The single, obvious primary action for this phase. */
  primary: React.ReactNode;
  /** Lower-emphasis actions (outline/ghost buttons or a Menu). */
  secondary?: React.ReactNode;
  /** Small status content shown on the left (timer, counts, hints). */
  status?: React.ReactNode;
  /** Short one-line reminder of the next step, shown under the label. */
  hint?: string;
  className?: string;
};

/**
 * The single facilitator command area for a phase. It replaces scattered
 * "Facilitator controls" / "Move on" boxes with one consistent bar:
 *
 *   [ FACILITATOR · hint ]  [ status ]  …  [ secondary ] [ PRIMARY ]
 *
 * It sticks to the bottom of the viewport so the one main action is always
 * obvious without competing with page content.
 */
export function FacilitatorCommandBar({
  primary,
  secondary,
  status,
  hint,
  className,
}: FacilitatorCommandBarProps) {
  return (
    <div className={cn("sticky bottom-3 z-30 mt-2", className)}>
      <div className="retro-glow flex flex-col gap-3 rounded-2xl border border-primary/30 bg-card/90 p-2.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/75 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pl-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden shrink-0 flex-col sm:flex">
            <span className="retro-meta text-primary">Facilitator</span>
            {hint ? (
              <span className="max-w-[16rem] truncate text-xs text-muted-foreground">
                {hint}
              </span>
            ) : null}
          </span>
          {status ? (
            <div className="flex flex-wrap items-center gap-2">{status}</div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {secondary}
          {primary}
        </div>
      </div>
    </div>
  );
}
