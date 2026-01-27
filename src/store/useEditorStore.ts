import { create } from "zustand";
import type {
  QuestionDetail,
  TestCase,
  ExecutionMetadata,
} from "@/types";

interface EditorState {
  // Current problem
  currentProblem: QuestionDetail | null;
  currentTestCases: TestCase[];
  metadata: ExecutionMetadata | null;
  
  // Editor state
  code: string;
  language: string;
  
  // Custom test cases for "Run" feature
  customTestCases: Array<{ input: Record<string, unknown> }>;
  activeTestCaseIndex: number;
  activeTab: "description" | "solutions" | "submissions";
  
  // Actions
  setProblem: (problem: QuestionDetail) => void;
  setTestCases: (testCases: TestCase[]) => void;
  setMetadata: (metadata: ExecutionMetadata) => void;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  addCustomTestCase: (testCase: { input: Record<string, unknown> }) => void;
  removeCustomTestCase: (index: number) => void;
  updateCustomTestCase: (index: number, testCase: { input: Record<string, unknown> }) => void;
  setActiveTestCaseIndex: (index: number) => void;
  setActiveTab: (tab: "description" | "solutions" | "submissions") => void;
  reset: () => void;
}

const initialState = {
  currentProblem: null,
  currentTestCases: [],
  metadata: null,
  code: "",
  language: "java",
  customTestCases: [],
  activeTestCaseIndex: 0,
  activeTab: "description" as "description" | "solutions" | "submissions",
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setProblem: (problem) => set({ currentProblem: problem }),
  
  setTestCases: (testCases) => set({ currentTestCases: testCases }),
  
  setMetadata: (metadata) => set({ metadata }),
  
  setCode: (code) => set({ code }),
  
  setLanguage: (language) => set({ language }),
  
  addCustomTestCase: (testCase) =>
    set((state) => ({
      customTestCases: [...state.customTestCases, testCase],
    })),
  
  removeCustomTestCase: (index) =>
    set((state) => ({
      customTestCases: state.customTestCases.filter((_, i) => i !== index),
    })),
  
  updateCustomTestCase: (index, testCase) =>
    set((state) => ({
      customTestCases: state.customTestCases.map((tc, i) =>
        i === index ? testCase : tc
      ),
    })),
  
  setActiveTestCaseIndex: (index) => set({ activeTestCaseIndex: index }),
  
  reset: () => set(initialState),
}));
