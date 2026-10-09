import { toast } from "@/store/useToastStore";
import { readFocusModePreference, writeFocusModePreference } from "./storage";
import {
  exitDocumentFullscreen,
  getProblemWorkspace,
  leaveFocusMode,
  readFullscreenElement,
  toggleBrowserFullscreen,
} from "./fullscreen";

/** User-gesture entry point for the fullscreen control and shortcut. */
export function enterOrToggleFullscreen(): void {
  void toggleBrowserFullscreen({
    workspace: getProblemWorkspace(),
    focusActive: readFocusModePreference(),
    enterFocus: () => writeFocusModePreference(true),
  }).then((result) => {
    if (result === "enter-failed") toast.error("Fullscreen could not be started.");
    if (result === "exit-failed") toast.error("Fullscreen could not be exited.");
  });
}

/**
 * Exit Focus Mode. If the workspace is browser-fullscreen, leave fullscreen first.
 * A failed exitFullscreen keeps Focus Mode on so UI state matches the browser.
 */
export function exitFocusMode(): void {
  void leaveFocusMode({
    fullscreenElement: typeof document === "undefined" ? null : readFullscreenElement(),
    exitFullscreen: async () => {
      const result = await exitDocumentFullscreen();
      if (result === "rejected") {
        throw new Error("exitFullscreen rejected");
      }
    },
    clearFocusPreference: () => writeFocusModePreference(false),
  }).then((result) => {
    if (result === "fullscreen-failed") toast.error("Fullscreen could not be exited.");
  });
}
