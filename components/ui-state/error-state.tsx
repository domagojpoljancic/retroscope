import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function ErrorState({
  title,
  description,
  actions,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("border-destructive/30 bg-destructive/5", className)}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
