import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  variant?: "page" | "card" | "inline";
  label?: string;
  className?: string;
};

export function LoadingState({
  variant = "page",
  label,
  className,
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 text-sm text-muted-foreground",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" />
        {label ?? "Loading…"}
      </span>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        {label ? (
          <p className="text-sm text-muted-foreground">{label}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
