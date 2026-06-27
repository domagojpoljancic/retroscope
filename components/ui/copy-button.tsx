"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";

type CopyButtonProps = Omit<ButtonProps, "onClick" | "children"> & {
  value: string;
  /** Lazily compute the value to copy at click time (overrides `value`). */
  onClickValue?: () => string | Promise<string>;
  label?: string;
  copiedLabel?: string;
  onCopied?: () => void;
};

export function CopyButton({
  value,
  onClickValue,
  label = "Copy",
  copiedLabel = "Copied",
  onCopied,
  variant = "outline",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={async () => {
        const toCopy = onClickValue ? await onClickValue() : value;
        const ok = await copyToClipboard(toCopy);
        if (ok) {
          setCopied(true);
          onCopied?.();
        }
      }}
      {...props}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
