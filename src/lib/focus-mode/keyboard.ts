const RADIX_POPUP_SELECTOR =
  "[data-radix-popper-content-wrapper], [data-radix-select-content], [role='dialog'], [role='alertdialog']";

const MONACO_SUGGEST_SELECTOR = ".monaco-editor .suggest-widget.visible";

/** Returns true when Escape should exit Focus Mode instead of being left to the editor. */
export function shouldEscapeExitFocusMode(): boolean {
  if (typeof document === "undefined") return true;
  if (document.querySelector(RADIX_POPUP_SELECTOR)) return false;
  if (document.querySelector(MONACO_SUGGEST_SELECTOR)) return false;
  return true;
}

export type FocusModeKeyDownContext = {
  focusModeActive: boolean;
  onToggle: () => void;
  onExit: () => void;
  /** When the browser is fullscreen, Escape is left to the browser. */
  browserFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onToggleEditorMaximize?: () => void;
};

type FocusModeKeyEvent = Pick<
  KeyboardEvent,
  "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey" | "defaultPrevented" | "preventDefault"
>;

export function handleFocusModeKeyDown(event: FocusModeKeyEvent, ctx: FocusModeKeyDownContext): void {
  if (event.defaultPrevented) return;

  const mod = event.metaKey || event.ctrlKey;

  if (mod && event.shiftKey && event.key.toLowerCase() === "f" && !event.altKey) {
    event.preventDefault();
    ctx.onToggle();
    return;
  }

  // Ctrl+Alt+Enter toggles browser fullscreen. F11 is not intercepted.
  if (mod && event.altKey && !event.shiftKey && event.key === "Enter" && ctx.onToggleFullscreen) {
    event.preventDefault();
    ctx.onToggleFullscreen();
    return;
  }

  if (mod && event.altKey && !event.shiftKey && event.key.toLowerCase() === "m" && ctx.onToggleEditorMaximize) {
    event.preventDefault();
    ctx.onToggleEditorMaximize();
    return;
  }

  if (event.key === "Escape") {
    // The browser exits fullscreen on Escape. Do not prevent that default.
    if (ctx.browserFullscreen) return;
    if (ctx.focusModeActive && shouldEscapeExitFocusMode()) {
      event.preventDefault();
      ctx.onExit();
    }
  }
}
