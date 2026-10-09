"use client";

import { useSyncExternalStore } from "react";
import {
  isFullscreenApiSupported,
  isWorkspaceFullscreenElement,
  readFullscreenElement,
  subscribeFullscreenChanges,
} from "@/lib/focus-mode/fullscreen";

function subscribeNothing(): () => void {
  return () => undefined;
}

/** Browser fullscreen state. `active` is true only while the problem workspace is the fullscreen element. */
export function useWorkspaceFullscreenState() {
  const fullscreenElement = useSyncExternalStore(
    subscribeFullscreenChanges,
    readFullscreenElement,
    () => null
  );
  const supported = useSyncExternalStore(subscribeNothing, isFullscreenApiSupported, () => false);

  return {
    supported,
    active: isWorkspaceFullscreenElement(fullscreenElement),
  };
}
