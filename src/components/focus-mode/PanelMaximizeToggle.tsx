"use client";

import { Button } from "@/components/ui/button";
import { MAXIMIZE_EDITOR_SHORTCUT_LABEL } from "@/lib/focus-mode/constants";
import type { WorkspacePanel } from "@/lib/focus-mode/panels";
import { Maximize2, Minimize2 } from "lucide-react";
import { useWorkspaceLayout } from "./WorkspaceLayoutContext";

const COPY: Record<WorkspacePanel, { maximize: string; restore: string }> = {
  problem: { maximize: "Maximize problem", restore: "Restore layout" },
  editor: { maximize: "Maximize editor", restore: "Restore layout" },
  console: { maximize: "Maximize testcases", restore: "Restore layout" },
};

export function PanelMaximizeToggle({ panel }: { panel: WorkspacePanel }) {
  const { maximizedPanel, toggleMaximizedPanel } = useWorkspaceLayout();
  const active = maximizedPanel === panel;
  const label = active ? COPY[panel].restore : COPY[panel].maximize;
  const shortcut = panel === "editor" ? ` (${MAXIMIZE_EDITOR_SHORTCUT_LABEL})` : "";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-7 shrink-0"
      onClick={() => toggleMaximizedPanel(panel)}
      title={`${label}${shortcut}`}
      aria-label={label}
      aria-pressed={active}
    >
      {active ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
    </Button>
  );
}
