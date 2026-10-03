"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/lib/utils";

const ICONS = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
} as const;

const ICON_TONE = {
  default: "text-muted-foreground",
  success: "text-success",
  error: "text-destructive",
} as const;

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border bg-popover px-3.5 py-3 text-popover-foreground shadow-lg",
              "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
              t.tone === "error" && "border-destructive/30"
            )}
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", ICON_TONE[t.tone])} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-5">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-mr-1 flex size-6 shrink-0 items-center justify-center rounded text-subtle-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
