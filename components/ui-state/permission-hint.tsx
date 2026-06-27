import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

type PermissionHintProps = {
  message: string;
  className?: string;
};

export function PermissionHint({ message, className }: PermissionHintProps) {
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
