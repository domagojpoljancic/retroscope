import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  className?: string;
  /** Optional highlight ring, e.g. for the active viewer. */
  active?: boolean;
};

const PALETTE = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-orange-500",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({ name, className, active }: AvatarProps) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm",
        colorFor(name),
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className,
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
