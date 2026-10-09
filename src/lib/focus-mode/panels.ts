export type WorkspacePanel = "problem" | "editor" | "console";

export type PanelLayoutHandle = {
  collapse: () => void;
  expand: () => void;
};

export type WorkspacePanelHandles = {
  problem: PanelLayoutHandle;
  right: PanelLayoutHandle;
  editor: PanelLayoutHandle;
  console: PanelLayoutHandle;
};

/** One panel may be maximized. Null is the user's split layout. */
export function nextMaximizedPanel(
  current: WorkspacePanel | null,
  target: WorkspacePanel
): WorkspacePanel | null {
  return current === target ? null : target;
}

export function visiblePanels(maximized: WorkspacePanel | null): WorkspacePanel[] {
  if (maximized == null) return ["problem", "editor", "console"];
  return [maximized];
}

export function isPanelHidden(panel: WorkspacePanel, maximized: WorkspacePanel | null): boolean {
  return maximized != null && maximized !== panel;
}

/**
 * Collapse siblings and expand the maximized panel.
 * react-resizable-panels remembers the pre-collapse size and restores it on expand(),
 * so this must not resize panels back to a hardcoded default.
 */
export function applyMaximizedLayout(panels: WorkspacePanelHandles, maximized: WorkspacePanel | null): void {
  if (maximized == null) {
    panels.problem.expand();
    panels.right.expand();
    panels.editor.expand();
    panels.console.expand();
    return;
  }

  if (maximized === "problem") {
    panels.problem.expand();
    panels.right.collapse();
    return;
  }

  if (maximized === "editor") {
    panels.right.expand();
    panels.editor.expand();
    panels.problem.collapse();
    panels.console.collapse();
    return;
  }

  panels.right.expand();
  panels.console.expand();
  panels.problem.collapse();
  panels.editor.collapse();
}

/** Layout changes call editor.layout() on the existing instance. They never replace it. */
export function relayoutEditor(editor: { layout?: () => void } | null | undefined): void {
  editor?.layout?.();
}

/** Double-click on a panel header maximizes it, except on controls inside that header. */
export function shouldIgnorePanelHeaderDoubleClick(target: unknown): boolean {
  if (!target || typeof target !== "object" || !("closest" in target)) return false;
  const closest = (target as { closest?: unknown }).closest;
  if (typeof closest !== "function") return false;
  return Boolean(closest.call(target, "button, a, input, textarea, select"));
}
