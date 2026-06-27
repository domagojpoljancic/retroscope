"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MenuContextValue = { close: () => void };
const MenuContext = createContext<MenuContextValue | null>(null);

type MenuProps = {
  /** Trigger button label. */
  label: React.ReactNode;
  /** Optional leading icon for the trigger. */
  icon?: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /** Horizontal alignment of the panel. */
  align?: "start" | "end";
  /** Open above the trigger (useful inside a bottom command bar). */
  openUp?: boolean;
  className?: string;
  panelClassName?: string;
  children: React.ReactNode;
};

/**
 * Lightweight dropdown menu used to group secondary/overflow actions so they
 * don't compete with the primary command. Closes on outside click or Escape.
 */
export function Menu({
  label,
  icon,
  variant = "outline",
  size = "sm",
  align = "end",
  openUp = false,
  className,
  panelClassName,
  children,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Button
        type="button"
        variant={variant}
        size={size}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
        {label}
      </Button>
      {open ? (
        <MenuContext.Provider value={{ close: () => setOpen(false) }}>
          <div
            role="menu"
            className={cn(
              "absolute z-40 min-w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg",
              align === "end" ? "right-0" : "left-0",
              openUp ? "bottom-full mb-2" : "top-full mt-2",
              panelClassName,
            )}
          >
            {children}
          </div>
        </MenuContext.Provider>
      ) : null}
    </div>
  );
}

type MenuItemProps = {
  onSelect: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function MenuItem({
  onSelect,
  icon,
  disabled,
  children,
  className,
}: MenuItemProps) {
  const ctx = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect();
        ctx?.close();
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        className,
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="retro-meta px-2.5 pb-1 pt-1.5 text-[10px]">{children}</p>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
