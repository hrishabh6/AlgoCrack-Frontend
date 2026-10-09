"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useFocusMode } from "@/hooks/useFocusMode";
import { useWorkspaceFullscreenState } from "@/hooks/useWorkspaceFullscreen";
import { enterOrToggleFullscreen } from "@/lib/focus-mode/actions";
import { describeWorkspaceTransition } from "@/lib/focus-mode/announcements";
import {
  exitDocumentFullscreen,
  fullscreenCleanupForPath,
  readFullscreenElement,
  setFullscreenPortalContainer,
  subscribeFullscreenChanges,
  syncFullscreenPortalContainer,
} from "@/lib/focus-mode/fullscreen";
import { handleFocusModeKeyDown } from "@/lib/focus-mode/keyboard";
import { nextMaximizedPanel, relayoutEditor, type WorkspacePanel } from "@/lib/focus-mode/panels";
import { isProblemSolvingRoute, shouldHideAppChrome } from "@/lib/focus-mode/routes";
import { useEditorStore } from "@/store";
import { WorkspaceLayoutProvider } from "./WorkspaceLayoutContext";

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onProblem = isProblemSolvingRoute(pathname);
  const { isActive, toggle, exit } = useFocusMode();
  const { active: workspaceFullscreen } = useWorkspaceFullscreenState();
  const chromeHidden = shouldHideAppChrome(pathname, isActive);
  const priorOverflow = useRef<string | null>(null);
  const [maximizedPanel, setMaximizedPanel] = useState<WorkspacePanel | null>(null);
  if (!onProblem && maximizedPanel !== null) {
    setMaximizedPanel(null);
  }
  const [announcement, setAnnouncement] = useState("");
  const announced = useRef(false);
  const announcedSnapshot = useRef({
    focus: false,
    fullscreen: false,
    maximized: null as WorkspacePanel | null,
  });

  const toggleMaximizedPanel = useCallback((panel: WorkspacePanel) => {
    setMaximizedPanel((current) => nextMaximizedPanel(current, panel));
  }, []);

  const visibleMaximized = onProblem ? maximizedPanel : null;
  const layoutValue = useMemo(
    () => ({ maximizedPanel: visibleMaximized, toggleMaximizedPanel }),
    [visibleMaximized, toggleMaximizedPanel]
  );

  useEffect(() => {
    if (!chromeHidden) {
      if (priorOverflow.current !== null) {
        document.body.style.overflow = priorOverflow.current;
        priorOverflow.current = null;
      }
      return;
    }

    priorOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (priorOverflow.current !== null) {
        document.body.style.overflow = priorOverflow.current;
        priorOverflow.current = null;
      }
    };
  }, [chromeHidden]);

  useEffect(() => {
    syncFullscreenPortalContainer();
    return subscribeFullscreenChanges(() => {
      syncFullscreenPortalContainer();
    });
  }, []);

  useEffect(() => {
    return () => {
      setFullscreenPortalContainer(null);
    };
  }, []);

  useEffect(() => {
    if (fullscreenCleanupForPath(onProblem, readFullscreenElement()) === "exit") {
      void exitDocumentFullscreen();
    }
  }, [onProblem]);

  useEffect(() => {
    if (!isProblemSolvingRoute(pathname)) return;

    const onKeyDown = (event: KeyboardEvent) => {
      handleFocusModeKeyDown(event, {
        focusModeActive: isActive,
        browserFullscreen: workspaceFullscreen,
        onToggle: toggle,
        onExit: exit,
        onToggleFullscreen: enterOrToggleFullscreen,
        onToggleEditorMaximize: () => toggleMaximizedPanel("editor"),
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, isActive, workspaceFullscreen, toggle, exit, toggleMaximizedPanel]);

  useEffect(() => {
    const editor = useEditorStore.getState().editorRef;
    const raf = window.requestAnimationFrame(() => {
      relayoutEditor(editor);
    });
    return () => window.cancelAnimationFrame(raf);
  }, [chromeHidden, workspaceFullscreen, visibleMaximized]);

  useEffect(() => {
    const next = {
      focus: chromeHidden,
      fullscreen: workspaceFullscreen,
      maximized: visibleMaximized,
    };
    if (!announced.current) {
      announced.current = true;
      announcedSnapshot.current = next;
      return;
    }
    const message = describeWorkspaceTransition(announcedSnapshot.current, next);
    announcedSnapshot.current = next;
    if (message) setAnnouncement(message);
  }, [chromeHidden, workspaceFullscreen, visibleMaximized]);

  return (
    <WorkspaceLayoutProvider value={layoutValue}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </WorkspaceLayoutProvider>
  );
}
