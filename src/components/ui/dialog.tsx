"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogVariant = "center" | "sheet-left" | "sheet-right";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Visually hide the title (it is still announced to assistive tech). */
  hideTitle?: boolean;
  variant?: DialogVariant;
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const VARIANT_CLASSES: Record<DialogVariant, string> = {
  center:
    "m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border max-h-[calc(100dvh-2rem)]",
  "sheet-left":
    "my-0 ml-0 mr-auto h-dvh max-h-none w-[min(320px,calc(100%-3rem))] max-w-none border-r",
  "sheet-right":
    "my-0 mr-0 ml-auto h-dvh max-h-none w-[min(360px,calc(100%-3rem))] max-w-none border-l",
};

const PANEL_ANIMATION: Record<DialogVariant, string> = {
  center: "animate-in fade-in-0 zoom-in-95 duration-150",
  "sheet-left": "animate-in slide-in-from-left duration-200",
  "sheet-right": "animate-in slide-in-from-right duration-200",
};

/**
 * Modal dialog / side sheet built on the native <dialog> element, which provides the top layer,
 * focus containment, Escape-to-close and inert background without extra dependencies.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  hideTitle,
  variant = "center",
  className,
  children,
  footer,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => onOpenChange(false)}
      onClick={(e) => {
        // Clicks on the backdrop target the <dialog> element itself.
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      className={cn(
        "bg-popover p-0 text-popover-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-[1px] open:flex",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {open && (
        <div className={cn("flex min-h-0 w-full flex-col", PANEL_ANIMATION[variant])}>
          <div className="flex items-start gap-3 px-5 pb-2 pt-4">
            <div className={cn("min-w-0 flex-1 space-y-1", hideTitle && "sr-only")}>
              <h2 id={titleId} className="text-base font-semibold leading-6 text-foreground">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="-mr-2 ml-auto flex size-8 shrink-0 items-center justify-center rounded-md text-subtle-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t bg-surface-2 px-5 py-3">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
