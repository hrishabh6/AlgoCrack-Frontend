import { afterEach, describe, expect, it, vi } from "vitest";
import { FOCUS_MODE_STORAGE_KEY } from "./constants";
import {
  WORKSPACE_FULLSCREEN_ATTR,
  bindFullscreenListeners,
  fullscreenCleanupForPath,
  isFullscreenApiSupported,
  isWorkspaceFullscreenElement,
  leaveFocusMode,
  overlayPortalContainer,
  readFullscreenPortalContainer,
  resetFullscreenModuleState,
  setFullscreenPortalContainer,
  shouldOfferFullscreenControl,
  subscribeFullscreenPortalContainer,
  syncFullscreenPortalContainer,
  toggleBrowserFullscreen,
} from "./fullscreen";

function workspaceElement(requestFullscreen = vi.fn().mockResolvedValue(undefined)): HTMLElement {
  return {
    hasAttribute: (name: string) => name === WORKSPACE_FULLSCREEN_ATTR,
    requestFullscreen,
  } as unknown as HTMLElement;
}

describe("fullscreen support", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetFullscreenModuleState();
  });

  it("hides the control when the Fullscreen API is missing", () => {
    expect(shouldOfferFullscreenControl(false)).toBe(false);
    expect(shouldOfferFullscreenControl(true)).toBe(true);
    expect(isFullscreenApiSupported()).toBe(false);
  });

  it("detects support from documentElement.requestFullscreen", () => {
    vi.stubGlobal("document", {
      documentElement: { requestFullscreen: vi.fn() },
      exitFullscreen: vi.fn(),
      fullscreenElement: null,
    });
    expect(isFullscreenApiSupported()).toBe(true);
  });
});

describe("toggleBrowserFullscreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetFullscreenModuleState();
  });

  function stubSupportedDocument(fullscreenElement: Element | null = null) {
    vi.stubGlobal("document", {
      documentElement: { requestFullscreen: vi.fn() },
      exitFullscreen: vi.fn(),
      fullscreenElement,
    });
  }

  it("invokes requestFullscreen on the workspace", async () => {
    stubSupportedDocument(null);
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const workspace = workspaceElement(requestFullscreen);
    const enterFocus = vi.fn();

    const result = await toggleBrowserFullscreen({
      workspace,
      focusActive: true,
      enterFocus,
      requestFullscreen: (element) => element.requestFullscreen(),
    });

    expect(result).toBe("entered");
    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(enterFocus).not.toHaveBeenCalled();
  });

  it("enters Focus Mode before requesting fullscreen", async () => {
    stubSupportedDocument(null);
    const enterFocus = vi.fn();
    const workspace = workspaceElement();

    await toggleBrowserFullscreen({
      workspace,
      focusActive: false,
      enterFocus,
      requestFullscreen: (element) => element.requestFullscreen(),
    });

    expect(enterFocus).toHaveBeenCalledOnce();
  });

  it("keeps Focus Mode usable when requestFullscreen rejects", async () => {
    stubSupportedDocument(null);
    const enterFocus = vi.fn();
    const workspace = workspaceElement(vi.fn().mockRejectedValue(new Error("denied")));

    const result = await toggleBrowserFullscreen({
      workspace,
      focusActive: true,
      enterFocus,
      requestFullscreen: () => Promise.reject(new Error("denied")),
    });

    expect(result).toBe("enter-failed");
    expect(enterFocus).not.toHaveBeenCalled();
  });

  it("exits browser fullscreen without throwing when exitFullscreen rejects", async () => {
    const current = workspaceElement();
    stubSupportedDocument(current);

    const result = await toggleBrowserFullscreen({
      workspace: workspaceElement(),
      focusActive: true,
      enterFocus: vi.fn(),
      fullscreenElement: current,
      exitFullscreen: () => Promise.reject(new Error("blocked")),
    });

    expect(result).toBe("exit-failed");
  });

  it("does not persist fullscreen in sessionStorage", async () => {
    const store = new Map<string, string>();
    stubSupportedDocument(null);
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    });

    await toggleBrowserFullscreen({
      workspace: workspaceElement(),
      focusActive: false,
      enterFocus: () => store.set(FOCUS_MODE_STORAGE_KEY, "true"),
      requestFullscreen: (element) => element.requestFullscreen(),
    });

    expect(store.get(FOCUS_MODE_STORAGE_KEY)).toBe("true");
    expect([...store.keys()]).toEqual([FOCUS_MODE_STORAGE_KEY]);
  });
});

describe("fullscreenchange state", () => {
  afterEach(() => {
    resetFullscreenModuleState();
  });

  it("derives the portal container from the fullscreen element", () => {
    const workspace = workspaceElement();
    const other = { hasAttribute: () => false } as unknown as Element;

    expect(isWorkspaceFullscreenElement(workspace)).toBe(true);
    expect(overlayPortalContainer(workspace)).toBe(workspace);
    expect(overlayPortalContainer(other)).toBeNull();
    expect(overlayPortalContainer(null)).toBeNull();

    syncFullscreenPortalContainer(workspace);
    expect(readFullscreenPortalContainer()).toBe(workspace);

    syncFullscreenPortalContainer(null);
    expect(readFullscreenPortalContainer()).toBeNull();
  });

  it("notifies subscribers when an external fullscreen exit clears the container", () => {
    const listener = vi.fn();
    const stop = subscribeFullscreenPortalContainer(listener);
    const workspace = workspaceElement();

    setFullscreenPortalContainer(workspace);
    setFullscreenPortalContainer(null);

    expect(listener).toHaveBeenCalledTimes(2);
    stop();
    setFullscreenPortalContainer(workspace);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("removes fullscreen listeners on cleanup so re-entry does not duplicate them", () => {
    const listeners = new Map<string, Set<() => void>>();
    const target = {
      addEventListener: (type: string, listener: () => void) => {
        const set = listeners.get(type) ?? new Set<() => void>();
        set.add(listener);
        listeners.set(type, set);
      },
      removeEventListener: (type: string, listener: () => void) => {
        listeners.get(type)?.delete(listener);
      },
    };
    const onChange = () => undefined;

    const stop = bindFullscreenListeners(target, onChange);
    expect(listeners.get("fullscreenchange")?.size).toBe(1);
    expect(listeners.get("fullscreenerror")?.size).toBe(1);
    stop();
    expect(listeners.get("fullscreenchange")?.size).toBe(0);

    const stopAgain = bindFullscreenListeners(target, onChange);
    expect(listeners.get("fullscreenchange")?.size).toBe(1);
    stopAgain();
    expect(listeners.get("fullscreenchange")?.size).toBe(0);
  });
});

describe("leaveFocusMode", () => {
  it("exits fullscreen and then clears Focus Mode", async () => {
    const order: string[] = [];
    const result = await leaveFocusMode({
      fullscreenElement: workspaceElement(),
      exitFullscreen: async () => {
        order.push("exit-fullscreen");
      },
      clearFocusPreference: () => order.push("clear-focus"),
    });

    expect(result).toBe("left");
    expect(order).toEqual(["exit-fullscreen", "clear-focus"]);
  });

  it("does not clear Focus Mode when exitFullscreen fails", async () => {
    const clearFocusPreference = vi.fn();
    const result = await leaveFocusMode({
      fullscreenElement: workspaceElement(),
      exitFullscreen: () => Promise.reject(new Error("blocked")),
      clearFocusPreference,
    });

    expect(result).toBe("fullscreen-failed");
    expect(clearFocusPreference).not.toHaveBeenCalled();
  });

  it("clears Focus Mode when the browser is not fullscreen", async () => {
    const clearFocusPreference = vi.fn();
    const exitFullscreen = vi.fn();
    const result = await leaveFocusMode({
      fullscreenElement: null,
      exitFullscreen,
      clearFocusPreference,
    });

    expect(result).toBe("left");
    expect(exitFullscreen).not.toHaveBeenCalled();
    expect(clearFocusPreference).toHaveBeenCalledOnce();
  });
});

describe("fullscreenCleanupForPath", () => {
  it("exits fullscreen after leaving the problem workspace", () => {
    const workspace = workspaceElement();
    expect(fullscreenCleanupForPath(false, workspace)).toBe("exit");
    expect(fullscreenCleanupForPath(true, workspace)).toBe("keep");
    expect(fullscreenCleanupForPath(false, null)).toBe("keep");
  });
});
