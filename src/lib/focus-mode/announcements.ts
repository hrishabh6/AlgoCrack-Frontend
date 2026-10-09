import type { WorkspacePanel } from "./panels";

export type WorkspaceSnapshot = {
  focus: boolean;
  fullscreen: boolean;
  maximized: WorkspacePanel | null;
};

/** Short polite announcements for major workspace transitions. Null means stay quiet. */
export function describeWorkspaceTransition(
  previous: WorkspaceSnapshot,
  next: WorkspaceSnapshot
): string | null {
  if (previous.fullscreen !== next.fullscreen) {
    if (next.fullscreen) return "Fullscreen enabled";
    if (next.focus) return "Fullscreen exited";
  }

  if (previous.focus !== next.focus) {
    return next.focus ? "Focus Mode enabled" : "Focus Mode exited";
  }

  if (previous.maximized !== next.maximized) {
    if (next.maximized === "editor") return "Editor maximized";
    if (next.maximized === "problem") return "Problem maximized";
    if (next.maximized === "console") return "Testcases maximized";
    return "Layout restored";
  }

  return null;
}
