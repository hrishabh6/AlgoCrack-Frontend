"use client";

import { Button } from "@/components/ui/button";
import { useFocusMode } from "@/hooks/useFocusMode";
import { FOCUS_MODE_TOGGLE_SHORTCUT_LABEL } from "@/lib/focus-mode/constants";
import { Focus, Minimize2 } from "lucide-react";

type FocusModeToggleProps = {
  /** When true, render as exit control (Focus Mode bar). */
  exitVariant?: boolean;
};

export function FocusModeToggle({ exitVariant = false }: FocusModeToggleProps) {
  const { isActive, toggle, exit } = useFocusMode();

  const active = exitVariant ? true : isActive;
  const onClick = exitVariant ? exit : toggle;

  const label = active ? "Exit Focus Mode" : "Enter Focus Mode";
  const tooltip = active
    ? `Exit Focus Mode (Escape or ${FOCUS_MODE_TOGGLE_SHORTCUT_LABEL})`
    : `Focus Mode (${FOCUS_MODE_TOGGLE_SHORTCUT_LABEL})`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-7 shrink-0"
      onClick={onClick}
      title={tooltip}
      aria-label={label}
      aria-pressed={isActive}
    >
      {active ? <Minimize2 aria-hidden="true" /> : <Focus aria-hidden="true" />}
    </Button>
  );
}
