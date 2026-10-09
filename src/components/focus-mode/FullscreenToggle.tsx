"use client";

import { Button } from "@/components/ui/button";
import { useWorkspaceFullscreenState } from "@/hooks/useWorkspaceFullscreen";
import { enterOrToggleFullscreen } from "@/lib/focus-mode/actions";
import { FULLSCREEN_TOGGLE_SHORTCUT_LABEL } from "@/lib/focus-mode/constants";
import { Fullscreen, Shrink } from "lucide-react";

export function FullscreenToggle() {
  const { supported, active } = useWorkspaceFullscreenState();
  if (!supported) return null;

  const label = active ? "Exit fullscreen" : "Enter fullscreen";
  const tooltip = active
    ? `Exit fullscreen (Escape or ${FULLSCREEN_TOGGLE_SHORTCUT_LABEL})`
    : `Fullscreen (${FULLSCREEN_TOGGLE_SHORTCUT_LABEL})`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-7 shrink-0"
      onClick={() => enterOrToggleFullscreen()}
      title={tooltip}
      aria-label={label}
      aria-pressed={active}
    >
      {active ? <Shrink aria-hidden="true" /> : <Fullscreen aria-hidden="true" />}
    </Button>
  );
}
