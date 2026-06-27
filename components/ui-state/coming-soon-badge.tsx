import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ComingSoonBadgeProps = {
  label?: string;
  className?: string;
};

export function ComingSoonBadge({
  label = "Coming soon",
  className,
}: ComingSoonBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-dashed", className)}
    >
      <Construction className="size-3" />
      {label}
    </Badge>
  );
}
