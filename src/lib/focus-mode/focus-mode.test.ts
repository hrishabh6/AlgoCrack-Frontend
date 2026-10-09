import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { handleFocusModeKeyDown, shouldEscapeExitFocusMode } from "./keyboard";
import { isProblemSolvingRoute, shouldHideAppChrome } from "./routes";
import {
  readFocusModePreference,
  writeFocusModePreference,
  subscribeFocusModePreference,
} from "./storage";
import { FOCUS_MODE_CHANGE_EVENT, FOCUS_MODE_STORAGE_KEY } from "./constants";

describe("isProblemSolvingRoute", () => {
  it("matches single-problem editor routes", () => {
    expect(isProblemSolvingRoute("/problems/42-two-sum")).toBe(true);
    expect(isProblemSolvingRoute("/problems/two-sum")).toBe(true);
  });

  it("excludes lists and index", () => {
    expect(isProblemSolvingRoute("/problems")).toBe(false);
    expect(isProblemSolvingRoute("/problems/lists")).toBe(false);
    expect(isProblemSolvingRoute("/problems/lists/1")).toBe(false);
  });
});

describe("shouldHideAppChrome", () => {
  it("hides chrome only on problem workspace when focus is active", () => {
    expect(shouldHideAppChrome("/problems/1-foo", true)).toBe(true);
    expect(shouldHideAppChrome("/problems/1-foo", false)).toBe(false);
    expect(shouldHideAppChrome("/profile", true)).toBe(false);
  });
});

describe("handleFocusModeKeyDown", () => {
  it("toggles on Ctrl+Shift+F", () => {
    const onToggle = vi.fn();
    const onExit = vi.fn();
    const preventDefault = vi.fn();

    handleFocusModeKeyDown(
      {
        key: "f",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
        defaultPrevented: false,
        preventDefault,
      },
      { focusModeActive: false, onToggle, onExit }
    );

    expect(onToggle).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalled();
  });

  it("exits on Escape when focus mode is active", () => {
    const onToggle = vi.fn();
    const onExit = vi.fn();
    const preventDefault = vi.fn();

    handleFocusModeKeyDown(
      {
        key: "Escape",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        defaultPrevented: false,
        preventDefault,
      },
      { focusModeActive: true, onToggle, onExit }
    );

    expect(onExit).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalled();
  });

  it("leaves Escape to the browser while fullscreen", () => {
    const onExit = vi.fn();
    const preventDefault = vi.fn();

    handleFocusModeKeyDown(
      {
        key: "Escape",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        defaultPrevented: false,
        preventDefault,
      },
      { focusModeActive: true, browserFullscreen: true, onToggle: vi.fn(), onExit }
    );

    expect(onExit).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("does not intercept F11", () => {
    const onToggleFullscreen = vi.fn();
    const preventDefault = vi.fn();

    handleFocusModeKeyDown(
      {
        key: "F11",
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        defaultPrevented: false,
        preventDefault,
      },
      { focusModeActive: true, onToggle: vi.fn(), onExit: vi.fn(), onToggleFullscreen }
    );

    expect(onToggleFullscreen).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("toggles fullscreen on Ctrl+Alt+Enter", () => {
    const onToggleFullscreen = vi.fn();
    const preventDefault = vi.fn();

    handleFocusModeKeyDown(
      {
        key: "Enter",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: true,
        defaultPrevented: false,
        preventDefault,
      },
      { focusModeActive: true, onToggle: vi.fn(), onExit: vi.fn(), onToggleFullscreen }
    );

    expect(onToggleFullscreen).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalled();
  });

  it("toggles editor maximize on Ctrl+Alt+M", () => {
    const onToggleEditorMaximize = vi.fn();
    const preventDefault = vi.fn();

    handleFocusModeKeyDown(
      {
        key: "m",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: true,
        defaultPrevented: false,
        preventDefault,
      },
      { focusModeActive: true, onToggle: vi.fn(), onExit: vi.fn(), onToggleEditorMaximize }
    );

    expect(onToggleEditorMaximize).toHaveBeenCalledOnce();
  });
});

describe("focus mode session storage", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats malformed persisted values as off", () => {
    store.set(FOCUS_MODE_STORAGE_KEY, "fullscreen");
    expect(readFocusModePreference()).toBe(false);
    store.set(FOCUS_MODE_STORAGE_KEY, "{\"fullscreen\":true}");
    expect(readFocusModePreference()).toBe(false);
  });

  it("persists preference in sessionStorage", () => {
    expect(readFocusModePreference()).toBe(false);
    writeFocusModePreference(true);
    expect(store.get(FOCUS_MODE_STORAGE_KEY)).toBe("true");
    expect(readFocusModePreference()).toBe(true);
    writeFocusModePreference(false);
    expect(readFocusModePreference()).toBe(false);
  });

  it("dispatches change event on write", () => {
    writeFocusModePreference(true);
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: FOCUS_MODE_CHANGE_EVENT }));
  });

  it("subscribes to custom change events", () => {
    const listener = vi.fn();
    subscribeFocusModePreference(listener);
    expect(window.addEventListener).toHaveBeenCalledWith(FOCUS_MODE_CHANGE_EVENT, expect.any(Function));
  });
});

describe("shouldEscapeExitFocusMode", () => {
  it("returns true when no blocking overlays exist", () => {
    vi.stubGlobal("document", { querySelector: () => null });
    expect(shouldEscapeExitFocusMode()).toBe(true);
    vi.unstubAllGlobals();
  });
});
