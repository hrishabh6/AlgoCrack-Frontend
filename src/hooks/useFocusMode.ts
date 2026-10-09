"use client";

import { useCallback, useSyncExternalStore } from "react";
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
    writeFocusModePreference(false);
  }, []);

  return { isActive, setActive, toggle, exit };
}
