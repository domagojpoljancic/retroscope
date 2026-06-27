import { Lock } from "lucide-react";

import { PERMISSION_MESSAGES } from "@/lib/validation";
import { cn } from "@/lib/utils";

type ReadOnlyBannerProps = {
  message?: string;
  className?: string;
};

export function ReadOnlyBanner({
  message = PERMISSION_MESSAGES.readOnlyBoard,
  className,
}: ReadOnlyBannerProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
      role="status"
    >
      <Lock className="size-4 shrink-0" />
      {message}
    </div>
  );
}
