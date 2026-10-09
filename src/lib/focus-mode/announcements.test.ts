import { describe, expect, it } from "vitest";
import { describeWorkspaceTransition, type WorkspaceSnapshot } from "./announcements";

const base: WorkspaceSnapshot = { focus: false, fullscreen: false, maximized: null };

describe("describeWorkspaceTransition", () => {
  it("announces focus and fullscreen separately", () => {
    expect(describeWorkspaceTransition(base, { ...base, focus: true })).toBe("Focus Mode enabled");
    expect(
      describeWorkspaceTransition(
        { focus: true, fullscreen: false, maximized: null },
        { focus: true, fullscreen: true, maximized: null }
      )
    ).toBe("Fullscreen enabled");
    expect(
      describeWorkspaceTransition(
        { focus: true, fullscreen: true, maximized: null },
        { focus: true, fullscreen: false, maximized: null }
      )
    ).toBe("Fullscreen exited");
    expect(
      describeWorkspaceTransition(
        { focus: true, fullscreen: false, maximized: null },
        { focus: false, fullscreen: false, maximized: null }
      )
    ).toBe("Focus Mode exited");
  });

  it("announces editor maximize and restore", () => {
    expect(
      describeWorkspaceTransition(
        { focus: true, fullscreen: false, maximized: null },
        { focus: true, fullscreen: false, maximized: "editor" }
      )
    ).toBe("Editor maximized");
    expect(
      describeWorkspaceTransition(
        { focus: true, fullscreen: false, maximized: "editor" },
        { focus: true, fullscreen: false, maximized: null }
      )
    ).toBe("Layout restored");
  });
});
