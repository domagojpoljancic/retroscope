import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SuccessStateProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function SuccessState({
  title,
  description,
  children,
  className,
}: SuccessStateProps) {
  return (
    <Card className={cn("border-retro-teal/30 bg-retro-teal/5", className)}>
      <CardContent className="space-y-3 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-retro-teal/15 text-retro-teal">
            <CheckCircle2 className="size-5" />
          </span>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
