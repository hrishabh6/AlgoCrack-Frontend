import { FOCUS_MODE_CHANGE_EVENT, FOCUS_MODE_STORAGE_KEY } from "./constants";

function canUseSessionStorage(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const probe = "__algocrack_focus_probe__";
    window.sessionStorage.setItem(probe, "1");
    window.sessionStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readFocusModePreference(): boolean {
  if (!canUseSessionStorage()) return false;
  return window.sessionStorage.getItem(FOCUS_MODE_STORAGE_KEY) === "true";
}

export function writeFocusModePreference(active: boolean): void {
  if (!canUseSessionStorage()) return;
  if (active) {
    window.sessionStorage.setItem(FOCUS_MODE_STORAGE_KEY, "true");
  } else {
    window.sessionStorage.removeItem(FOCUS_MODE_STORAGE_KEY);
  }
  window.dispatchEvent(new Event(FOCUS_MODE_CHANGE_EVENT));
}

export function subscribeFocusModePreference(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const handler = () => onStoreChange();
  window.addEventListener(FOCUS_MODE_CHANGE_EVENT, handler);
  return () => window.removeEventListener(FOCUS_MODE_CHANGE_EVENT, handler);
}
