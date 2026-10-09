"use client";

import { useCallback, useSyncExternalStore } from "react";
import { exitFocusMode } from "@/lib/focus-mode/actions";
import {
  readFocusModePreference,
  subscribeFocusModePreference,
  writeFocusModePreference,
} from "@/lib/focus-mode/storage";

function getServerFocusModeSnapshot(): boolean {
  return false;
}

export function useFocusMode() {
  const isActive = useSyncExternalStore(
    subscribeFocusModePreference,
    readFocusModePreference,
    getServerFocusModeSnapshot
  );

  const setActive = useCallback((active: boolean) => {
    writeFocusModePreference(active);
  }, []);

  const toggle = useCallback(() => {
    writeFocusModePreference(!readFocusModePreference());
  }, []);

  const exit = useCallback(() => {
    exitFocusMode();
  }, []);

  return { isActive, setActive, toggle, exit };
}
