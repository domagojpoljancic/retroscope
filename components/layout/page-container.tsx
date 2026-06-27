import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

const sizeClasses = {
  default: "max-w-5xl",
  narrow: "max-w-3xl",
  wide: "max-w-6xl",
};

export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </main>
  );
}
