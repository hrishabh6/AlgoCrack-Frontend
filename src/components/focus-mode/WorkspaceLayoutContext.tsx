"use client";

import { createContext, useContext } from "react";
import type { WorkspacePanel } from "@/lib/focus-mode/panels";

export type WorkspaceLayoutValue = {
  maximizedPanel: WorkspacePanel | null;
  toggleMaximizedPanel: (panel: WorkspacePanel) => void;
};

const WorkspaceLayoutContext = createContext<WorkspaceLayoutValue | null>(null);

export function WorkspaceLayoutProvider({
  value,
  children,
}: {
  value: WorkspaceLayoutValue;
  children: React.ReactNode;
}) {
  return <WorkspaceLayoutContext.Provider value={value}>{children}</WorkspaceLayoutContext.Provider>;
}

export function useWorkspaceLayout(): WorkspaceLayoutValue {
  const value = useContext(WorkspaceLayoutContext);
  if (!value) {
    throw new Error("useWorkspaceLayout must be used within FocusModeProvider");
  }
  return value;
}
