import { cn } from "@/lib/utils";
import { PRODUCT } from "@/lib/constants";

type BrandMarkProps = {
  className?: string;
  /** Size of the lens glyph. */
  size?: "sm" | "md" | "lg";
  /** Show the product wordmark next to the lens. */
  showWordmark?: boolean;
  /** Show the "Look back. Move forward." tape label under the wordmark. */
  showTagline?: boolean;
};

const LENS_SIZES: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  sm: "size-8",
  md: "size-9",
  lg: "size-11",
};

const WORDMARK_SIZES: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * Retroscope brand treatment: a retro "scope" lens glyph plus an optional
 * wordmark and tape-style tagline. Uses CSS gradients only (no image assets).
 */
export function BrandLens({
  className,
  size = "md",
}: {
  className?: string;
  size?: BrandMarkProps["size"];
}) {
  return (
    <span
      className={cn(
        "retro-glow relative grid shrink-0 place-items-center overflow-hidden rounded-xl text-primary-foreground",
        LENS_SIZES[size ?? "md"],
        className,
      )}
      aria-hidden
    >
      <span className="retro-gradient-panel absolute inset-0 rounded-xl" />
      {/* Scope ring */}
      <span className="absolute inset-[3px] rounded-full border border-white/50" />
      {/* Reticle crosshair */}
      <span className="absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-white/40" />
      <span className="absolute inset-y-1.5 left-1/2 w-px -translate-x-1/2 bg-white/40" />
      {/* Scan line sweeping across the lens */}
      <span className="scope-scan absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
      {/* Center signal dot */}
      <span className="relative size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
    </span>
  );
}

export function BrandMark({
  className,
  size = "md",
  showWordmark = true,
  showTagline = false,
}: BrandMarkProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <BrandLens size={size} />
      {showWordmark ? (
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate font-semibold tracking-tight text-foreground",
              WORDMARK_SIZES[size ?? "md"],
            )}
          >
            {PRODUCT.name}
          </span>
          {showTagline ? (
            <span className="retro-meta mt-0.5 block truncate">
              {PRODUCT.tagline}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
