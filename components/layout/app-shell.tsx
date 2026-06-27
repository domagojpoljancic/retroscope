import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
};

export function AppShell({
  children,
  className,
  hideHeader = false,
}: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      {!hideHeader ? <SiteHeader /> : null}
      <div className={cn("flex flex-1 flex-col", className)}>{children}</div>
    </div>
  );
}
