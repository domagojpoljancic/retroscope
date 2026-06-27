import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlaceholderPanelProps = {
  title: string;
  description: string;
  highlights?: string[];
  className?: string;
};

export function PlaceholderPanel({
  title,
  description,
  highlights = [],
  className,
}: PlaceholderPanelProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Sparkles className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {highlights.length > 0 ? (
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-xl bg-muted/70 px-3 py-2 text-sm text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      ) : null}
    </Card>
  );
}
