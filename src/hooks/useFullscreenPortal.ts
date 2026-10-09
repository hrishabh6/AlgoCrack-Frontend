"use client";

import { useSyncExternalStore } from "react";
import {
  readFullscreenPortalContainer,
  subscribeFullscreenPortalContainer,
} from "@/lib/focus-mode/fullscreen";

/** Container for overlays while the workspace is fullscreen. Undefined keeps the default document.body portal. */
export function useFullscreenPortalContainer(): HTMLElement | undefined {
  const container = useSyncExternalStore(
    subscribeFullscreenPortalContainer,
    readFullscreenPortalContainer,
    () => null
  );
  return container ?? undefined;
}
