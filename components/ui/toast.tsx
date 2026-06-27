"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 3200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((item) => (
        <Toast key={item.id} item={item} />
      ))}
    </div>
  );
}

function Toast({ item }: { item: ToastItem }) {
  const Icon =
    item.variant === "success"
      ? CheckCircle2
      : item.variant === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-2 rounded-xl border bg-card px-4 py-3 text-sm shadow-lg",
        item.variant === "success" && "border-retro-teal/40",
        item.variant === "error" && "border-destructive/40",
        item.variant === "info" && "border-border",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          item.variant === "success" && "text-retro-teal",
          item.variant === "error" && "text-destructive",
          item.variant === "info" && "text-primary",
        )}
      />
      <span>{item.message}</span>
    </div>
  );
}
