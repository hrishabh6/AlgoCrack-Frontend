/**
 * Browser fullscreen is owned by the Fullscreen API.
 * React must read `document.fullscreenElement` rather than storing a parallel boolean.
 * Fullscreen is never written to sessionStorage — browsers require a user gesture.
 */

export const WORKSPACE_FULLSCREEN_ATTR = "data-problem-workspace";

export type FullscreenRequestResult = "entered" | "exited" | "enter-failed" | "exit-failed" | "unavailable";

export type LeaveFocusResult = "left" | "fullscreen-failed";

type ListenerTarget = {
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

let workspaceElement: HTMLElement | null = null;
let portalContainer: HTMLElement | null = null;
const portalListeners = new Set<() => void>();

export function registerProblemWorkspace(element: HTMLElement | null): void {
  workspaceElement = element;
}

export function getProblemWorkspace(): HTMLElement | null {
  return workspaceElement;
}

export function isFullscreenApiSupported(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return typeof root?.requestFullscreen === "function" && typeof document.exitFullscreen === "function";
}

export function readFullscreenElement(): Element | null {
  if (typeof document === "undefined") return null;
  return document.fullscreenElement ?? null;
}

export function isWorkspaceFullscreenElement(element: Element | null): boolean {
  if (!element || typeof element.hasAttribute !== "function") return false;
  return element.hasAttribute(WORKSPACE_FULLSCREEN_ATTR);
}

export function shouldOfferFullscreenControl(supported: boolean): boolean {
  return supported;
}

/** Portal overlays into the fullscreen workspace; otherwise let the UI library use document.body. */
export function overlayPortalContainer(fullscreenElement: Element | null): HTMLElement | null {
  if (!isWorkspaceFullscreenElement(fullscreenElement)) return null;
  return fullscreenElement as HTMLElement;
}

export function readFullscreenPortalContainer(): HTMLElement | null {
  return portalContainer;
}

export function setFullscreenPortalContainer(element: HTMLElement | null): void {
  if (portalContainer === element) return;
  portalContainer = element;
  portalListeners.forEach((listener) => listener());
}

export function subscribeFullscreenPortalContainer(onChange: () => void): () => void {
  portalListeners.add(onChange);
  return () => {
    portalListeners.delete(onChange);
  };
}

export function syncFullscreenPortalContainer(fullscreenElement: Element | null = readFullscreenElement()): void {
  setFullscreenPortalContainer(overlayPortalContainer(fullscreenElement));
}

export function subscribeFullscreenChanges(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  return bindFullscreenListeners(document, onChange);
}

export function bindFullscreenListeners(target: ListenerTarget, onChange: () => void): () => void {
  target.addEventListener("fullscreenchange", onChange);
  target.addEventListener("fullscreenerror", onChange);
  return () => {
    target.removeEventListener("fullscreenchange", onChange);
    target.removeEventListener("fullscreenerror", onChange);
  };
}

export async function exitDocumentFullscreen(): Promise<"ok" | "idle" | "rejected"> {
  if (typeof document === "undefined" || !document.fullscreenElement) return "idle";
  if (typeof document.exitFullscreen !== "function") return "rejected";
  try {
    await document.exitFullscreen();
    return "ok";
  } catch {
    return "rejected";
  }
}

export async function toggleBrowserFullscreen(deps: {
  workspace: HTMLElement | null;
  focusActive: boolean;
  enterFocus: () => void;
  fullscreenElement?: Element | null;
  requestFullscreen?: (element: HTMLElement) => Promise<void>;
  exitFullscreen?: () => Promise<void>;
}): Promise<FullscreenRequestResult> {
  if (typeof document === "undefined" || !isFullscreenApiSupported()) return "unavailable";

  const current = deps.fullscreenElement === undefined ? readFullscreenElement() : deps.fullscreenElement;
  const exitFullscreen = deps.exitFullscreen ?? (() => document.exitFullscreen());
  const requestFullscreen =
    deps.requestFullscreen ?? ((element: HTMLElement) => element.requestFullscreen());

  if (isWorkspaceFullscreenElement(current)) {
    try {
      await exitFullscreen();
      return "exited";
    } catch {
      return "exit-failed";
    }
  }

  if (!deps.focusActive) deps.enterFocus();

  const target = deps.workspace;
  if (!target) return "enter-failed";
  if (!deps.requestFullscreen && typeof target.requestFullscreen !== "function") return "enter-failed";
  try {
    await requestFullscreen(target);
    return "entered";
  } catch {
    return "enter-failed";
  }
}

/**
 * Explicit Exit Focus while fullscreen leaves both states.
 * If exitFullscreen rejects, Focus Mode stays on so React does not claim the browser left fullscreen.
 */
export async function leaveFocusMode(deps: {
  fullscreenElement: Element | null;
  exitFullscreen: () => Promise<void>;
  clearFocusPreference: () => void;
}): Promise<LeaveFocusResult> {
  if (isWorkspaceFullscreenElement(deps.fullscreenElement)) {
    try {
      await deps.exitFullscreen();
    } catch {
      return "fullscreen-failed";
    }
  }
  deps.clearFocusPreference();
  return "left";
}

/** Leave browser fullscreen when navigation moves off the problem workspace. */
export function fullscreenCleanupForPath(
  isProblemRoute: boolean,
  fullscreenElement: Element | null
): "exit" | "keep" {
  if (isProblemRoute) return "keep";
  return isWorkspaceFullscreenElement(fullscreenElement) ? "exit" : "keep";
}

/** Test-only reset so module state does not leak between cases. */
export function resetFullscreenModuleState(): void {
  workspaceElement = null;
  portalContainer = null;
  portalListeners.clear();
}
