import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { DEV_NAV_ITEMS, PRODUCT } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
};

export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            R
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold tracking-tight text-foreground">
              {PRODUCT.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {PRODUCT.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {DEV_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Badge variant="muted" className="hidden sm:inline-flex">
          Prototype
        </Badge>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {DEV_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
