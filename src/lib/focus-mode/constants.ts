export const FOCUS_MODE_STORAGE_KEY = "algocrack.problem.focusMode";

export const FOCUS_MODE_CHANGE_EVENT = "algocrack:focus-mode-change";

/**
 * Toggle Focus Mode.
 * Monaco's format binding is Shift+Alt+F and find is Ctrl+F, so Ctrl+Shift+F stays free.
 */
export const FOCUS_MODE_TOGGLE_SHORTCUT_LABEL = "Ctrl+Shift+F";

/**
 * Toggle browser fullscreen on the problem workspace.
 * Avoids Monaco's Ctrl+Enter (insert line below) and Ctrl+Shift+Enter (insert line above).
 * F11 is intentionally not handled — the browser owns that key.
 */
export const FULLSCREEN_TOGGLE_SHORTCUT_LABEL = "Ctrl+Alt+Enter";

/** Maximize or restore the code editor. Not a Monaco default binding. */
export const MAXIMIZE_EDITOR_SHORTCUT_LABEL = "Ctrl+Alt+M";
