import { create } from "zustand";
import type {
  LanguageDescriptor,
  PlaygroundRunResponse,
  PlaygroundSummary,
  PlaygroundWorkspaceSnapshot,
} from "@/types/playground";

function snapshotsEqual(a: PlaygroundWorkspaceSnapshot, b: PlaygroundWorkspaceSnapshot): boolean {
  return (
    a.id === b.id &&
    a.title === b.title &&
    a.language === b.language &&
    a.sourceCode === b.sourceCode &&
    a.stdin === b.stdin
  );
}

interface PlaygroundState {
  workspace: PlaygroundWorkspaceSnapshot;
  baseline: PlaygroundWorkspaceSnapshot;
  languages: LanguageDescriptor[];
  library: PlaygroundSummary[];
  runStatus: "idle" | "running";
  lastRun: PlaygroundRunResponse | null;
  setLanguages: (languages: LanguageDescriptor[]) => void;
  setLibrary: (items: PlaygroundSummary[]) => void;
  applyWorkspace: (workspace: PlaygroundWorkspaceSnapshot, asBaseline?: boolean) => void;
  patchWorkspace: (patch: Partial<PlaygroundWorkspaceSnapshot>) => void;
  markBaselineFromWorkspace: () => void;
  isDirty: () => boolean;
  setRunStatus: (runStatus: "idle" | "running") => void;
  setLastRun: (lastRun: PlaygroundRunResponse | null) => void;
  starterForLanguage: (code: PlaygroundWorkspaceSnapshot["language"]) => string;
}

const emptyWorkspace: PlaygroundWorkspaceSnapshot = {
  id: null,
  title: "Untitled Playground",
  language: "JAVA",
  sourceCode: "",
  stdin: "",
};

export const usePlaygroundStore = create<PlaygroundState>()((set, get) => ({
  workspace: { ...emptyWorkspace },
  baseline: { ...emptyWorkspace },
  languages: [],
  library: [],
  runStatus: "idle",
  lastRun: null,

  setLanguages: (languages) => set({ languages }),

  setLibrary: (library) => set({ library }),

  applyWorkspace: (workspace, asBaseline = true) =>
    set({
      workspace: { ...workspace },
      baseline: asBaseline ? { ...workspace } : get().baseline,
    }),

  patchWorkspace: (patch) =>
    set((state) => ({
      workspace: { ...state.workspace, ...patch },
    })),

  markBaselineFromWorkspace: () =>
    set((state) => ({
      baseline: { ...state.workspace },
    })),

  isDirty: () => !snapshotsEqual(get().workspace, get().baseline),

  setRunStatus: (runStatus) => set({ runStatus }),

  setLastRun: (lastRun) => set({ lastRun }),

  starterForLanguage: (code) => {
    const match = get().languages.find((l) => l.code === code);
    return match?.starterSource ?? "";
  },
}));
