// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/snippets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "outline",
  size = "sm",
  className,
  iconOnly = false,
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant={variant}
      size={iconOnly ? "icon" : size}
      className={cn(className)}
      aria-label={copied ? copiedLabel : label}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          await copyText(typeof text === "function" ? text() : text);
          setCopied(true);
          const what = label.replace(/^copy\s+/i, "").replace(/\s+svg$/i, "SVG");
          toast.success(what ? `${what} copied` : "Copied to clipboard");
          window.setTimeout(() => setCopied(false), 1400);
        } catch {
          setCopied(false);
          toast.error("Copy failed — clipboard unavailable");
        }
      }}
    >
      {iconOnly ? (
        <CopyMark copied={copied} />
      ) : (
        <span>{copied ? copiedLabel : label}</span>
      )}
    </Button>
  );
}

function CopyMark({ copied }) {
  if (copied) {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M5 12.5 9.2 17 19 7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="1.6" />
      <path d="M6.5 16H6A1.5 1.5 0 0 1 4.5 14.5V6A1.5 1.5 0 0 1 6 4.5h8.5A1.5 1.5 0 0 1 16 6v.5" />
    </svg>
  );
}
