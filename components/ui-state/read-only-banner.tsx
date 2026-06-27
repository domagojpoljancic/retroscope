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
        "mb-6 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning-foreground",
        className,
      )}
      role="status"
    >
      <span className="vhs-label bg-warning text-warning-foreground">
        <Lock className="size-3" />
        Read only
      </span>
      {message}
    </div>
  );
}
