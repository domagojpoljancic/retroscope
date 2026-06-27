import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent
        className={cn(
          "flex flex-col items-center gap-2 text-center",
          compact ? "px-4 py-6" : "px-6 py-12",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          {icon ?? <Inbox className="size-6" />}
        </span>
        {title ? <p className="text-base font-medium">{title}</p> : null}
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        {action ? <div className="pt-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function EmptyStateActionButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return <Button {...props}>{children}</Button>;
}
