import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type InlineValidationMessageProps = {
  message?: string | null;
  className?: string;
};

export function InlineValidationMessage({
  message,
  className,
}: InlineValidationMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className={cn(
        "flex items-start gap-1.5 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
