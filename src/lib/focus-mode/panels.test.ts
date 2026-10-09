import { describe, expect, it, vi } from "vitest";
import {
  applyMaximizedLayout,
  isPanelHidden,
  nextMaximizedPanel,
  relayoutEditor,
  shouldIgnorePanelHeaderDoubleClick,
  visiblePanels,
  type PanelLayoutHandle,
} from "./panels";

function handle(): PanelLayoutHandle {
  return { collapse: vi.fn(), expand: vi.fn() };
}

describe("panel maximization", () => {
  it("toggles a single maximized panel", () => {
    expect(nextMaximizedPanel(null, "editor")).toBe("editor");
    expect(nextMaximizedPanel("editor", "editor")).toBeNull();
    expect(nextMaximizedPanel("editor", "problem")).toBe("problem");
  });

  it("hides sibling panels while one is maximized", () => {
    expect(visiblePanels(null)).toEqual(["problem", "editor", "console"]);
    expect(visiblePanels("editor")).toEqual(["editor"]);
    expect(isPanelHidden("problem", "editor")).toBe(true);
    expect(isPanelHidden("console", "editor")).toBe(true);
    expect(isPanelHidden("editor", "editor")).toBe(false);
    expect(isPanelHidden("problem", null)).toBe(false);
  });

  it("collapses siblings for editor maximize and expands them on restore", () => {
    const panels = {
      problem: handle(),
      right: handle(),
      editor: handle(),
      console: handle(),
    };

    applyMaximizedLayout(panels, "editor");
    expect(panels.problem.collapse).toHaveBeenCalledOnce();
    expect(panels.console.collapse).toHaveBeenCalledOnce();
    expect(panels.editor.expand).toHaveBeenCalledOnce();
    expect(panels.editor.collapse).not.toHaveBeenCalled();

    applyMaximizedLayout(panels, null);
    expect(panels.problem.expand).toHaveBeenCalledOnce();
    expect(panels.console.expand).toHaveBeenCalledOnce();
    expect(panels.right.expand).toHaveBeenCalled();
  });

  it("collapses the editor column when the problem is maximized", () => {
    const panels = {
      problem: handle(),
      right: handle(),
      editor: handle(),
      console: handle(),
    };

    applyMaximizedLayout(panels, "problem");
    expect(panels.right.collapse).toHaveBeenCalledOnce();
    expect(panels.editor.collapse).not.toHaveBeenCalled();
    expect(panels.console.collapse).not.toHaveBeenCalled();
  });

  it("ignores double-clicks that start on header controls", () => {
    const button = { closest: (selector: string) => (selector.includes("button") ? button : null) };
    expect(shouldIgnorePanelHeaderDoubleClick(button)).toBe(true);
    expect(shouldIgnorePanelHeaderDoubleClick({ closest: () => null })).toBe(false);
    expect(shouldIgnorePanelHeaderDoubleClick(null)).toBe(false);
  });

  it("relayouts the existing editor instance", () => {
    const editor = { layout: vi.fn(), dispose: vi.fn() };
    relayoutEditor(editor);
    expect(editor.layout).toHaveBeenCalledOnce();
    expect(editor.dispose).not.toHaveBeenCalled();
    relayoutEditor(null);
  });
});
