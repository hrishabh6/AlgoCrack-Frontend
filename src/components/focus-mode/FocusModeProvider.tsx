"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useFocusMode } from "@/hooks/useFocusMode";
import { handleFocusModeKeyDown } from "@/lib/focus-mode/keyboard";
import { isProblemSolvingRoute, shouldHideAppChrome } from "@/lib/focus-mode/routes";
import { useEditorStore } from "@/store";

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isActive, toggle, exit } = useFocusMode();
  const chromeHidden = shouldHideAppChrome(pathname, isActive);
  const priorOverflow = useRef<string | null>(null);

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
    if (!isProblemSolvingRoute(pathname)) return;

    const onKeyDown = (event: KeyboardEvent) => {
      handleFocusModeKeyDown(event, {
        focusModeActive: isActive,
        onToggle: toggle,
        onExit: exit,
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, isActive, toggle, exit]);

  useEffect(() => {
    if (!chromeHidden) return;

    const editor = useEditorStore.getState().editorRef;
    const raf = window.requestAnimationFrame(() => {
      editor?.layout?.();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [chromeHidden]);

  return <>{children}</>;
}
