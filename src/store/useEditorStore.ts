import { create } from "zustand";
import type {
  QuestionDetail,
  TestCase,
  EditableTestCase,
  QuestionMetadata,
} from "@/types";
import { useUserStore } from "./useUserStore";

interface EditorState {
  // Current problem
  currentProblem: QuestionDetail | null;
  
  // Unified testcases - editable DEFAULT testcases + user-added
  testcases: EditableTestCase[];
  originalTestcases: EditableTestCase[];  // For reset functionality
  
  // Editor state
  code: string;
  language: string;
  metadata: QuestionMetadata | null;
  editorRef: any | null;
  
  // UI state
  activeTestCaseIndex: number;
  activeTab: "description" | "solutions" | "submissions" | "results";
  
  // Actions - Problem
  setProblem: (problem: QuestionDetail) => void;
  initializeTestcases: (testcases: TestCase[]) => void;
  
  // Actions - Code
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setEditorRef: (editor: any) => void;
  
  // Actions - Testcases (unified model)
  updateTestcaseInput: (index: number, input: string) => void;
  addTestcase: (input: string) => void;
  removeTestcase: (index: number) => void;
  resetTestcase: (index: number) => void;
  resetAllTestcases: () => void;
  
  // Actions - UI
  setActiveTestCaseIndex: (index: number) => void;
  setActiveTab: (tab: "description" | "solutions" | "submissions" | "results") => void;
  
  // Get testcases for API call (formatted for /run endpoint)
  getTestcasesForRun: () => Array<{ input: string }>;
  
  reset: () => void;
}

const initialState = {
  currentProblem: null,
  testcases: [] as EditableTestCase[],
  originalTestcases: [] as EditableTestCase[],
  code: "",
  language: "java",
  metadata: null,
  editorRef: null,
  activeTestCaseIndex: 0,
  activeTab: "description" as const,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  
  // Set the current problem
  setProblem: (problem) => {
    const metadata = problem.metadataList?.[0] ?? null;
    const lang = (metadata?.language ?? "java").toLowerCase();
    
    // Try to load saved code
    const userId = useUserStore.getState().userId;
    const key = `algocrack_code_${userId || 'guest'}_${problem.id}_${lang}`;
    let initialCode = metadata?.codeTemplate ?? "";
    
    if (typeof window !== 'undefined') {
        const savedCode = localStorage.getItem(key);
        if (savedCode) {
            initialCode = savedCode;
        }
    }

    set({ 
      currentProblem: problem,
      metadata,
      code: initialCode,
      language: lang,
    });
  },
  
  // Initialize testcases from problem's defaultTestcases
  // This converts TestCase[] to EditableTestCase[]
  initializeTestcases: (testcases) => {
    const editableTestcases: EditableTestCase[] = testcases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      originalInput: tc.input,
      isModified: false,
      isUserAdded: false,
    }));
    set({
      testcases: editableTestcases,
      originalTestcases: editableTestcases,
      activeTestCaseIndex: 0,
    });
  },
  
  // Update a testcase input
  updateTestcaseInput: (index, input) => {
    set((state) => {
      const newTestcases = [...state.testcases];
      const tc = newTestcases[index];
      if (tc) {
        const originalInput = state.originalTestcases[index]?.originalInput;
        newTestcases[index] = {
          ...tc,
          input,
          isModified: !tc.isUserAdded && input !== originalInput,
        };
      }
      return { testcases: newTestcases };
    });
  },
  
  // Add a new user-defined testcase
  addTestcase: (input) => {
    set((state) => ({
      testcases: [
        ...state.testcases,
        {
          id: null,
          input,
          originalInput: undefined,
          isModified: false,
          isUserAdded: true,
        },
      ],
      activeTestCaseIndex: state.testcases.length, // Select the new one
    }));
  },
  
  // Remove a testcase (only user-added ones can be removed)
  removeTestcase: (index) => {
    set((state) => {
      const tc = state.testcases[index];
      if (!tc?.isUserAdded) {
        // Can't remove default testcases, but can reset them
        return state;
      }
      const newTestcases = state.testcases.filter((_, i) => i !== index);
      return {
        testcases: newTestcases,
        activeTestCaseIndex: Math.min(state.activeTestCaseIndex, newTestcases.length - 1),
      };
    });
  },
  
  // Reset a single testcase to its original value
  resetTestcase: (index) => {
    set((state) => {
      const original = state.originalTestcases[index];
      if (!original || state.testcases[index]?.isUserAdded) {
        return state;
      }
      const newTestcases = [...state.testcases];
      newTestcases[index] = { ...original };
      return { testcases: newTestcases };
    });
  },
  
  // Reset all testcases to original + remove user-added
  resetAllTestcases: () => {
    set((state) => ({
      testcases: [...state.originalTestcases],
      activeTestCaseIndex: 0,
    }));
  },
  
  // Get testcases formatted for the /run API
  getTestcasesForRun: () => {
    return get().testcases.map((tc) => ({ input: tc.input }));
  },
  
  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTestCaseIndex: (index) => set({ activeTestCaseIndex: index }),
  // Actions - Code
  setCode: (code) => {
    set({ code });
    // Save to local storage
    const state = get();
    const { currentProblem, language } = state;
    const userId = useUserStore.getState().userId; // Access directly to avoid circular dependency issues if any
    
    if (currentProblem && language) {
       const key = `algocrack_code_${userId || 'guest'}_${currentProblem.id}_${language}`;
       localStorage.setItem(key, code);
    }
  },

  setLanguage: (language) => {
     // When switching language:
     // 1. Save current code? (Already saved via setCode)
     // 2. Load code for new language
     const state = get();
     const { currentProblem } = state;
     const userId = useUserStore.getState().userId;
     const newLang = language.toLowerCase();
     
     if (!currentProblem) {
         set({ language: newLang });
         return;
     }

     const key = `algocrack_code_${userId || 'guest'}_${currentProblem.id}_${newLang}`;
     const savedCode = localStorage.getItem(key);
     
     if (savedCode) {
         set({ language: newLang, code: savedCode });
     } else {
         // Find template for this language
         const metadata = currentProblem.metadataList.find(
             (m) => m.language.toLowerCase() === newLang
         );
         set({ language: newLang, code: metadata?.codeTemplate ?? "" });
     }
  },
  setEditorRef: (editorRef) => set({ editorRef }),
  
  reset: () => set(initialState),
}));

// ============================================================================
// Deprecated exports for backward compatibility during migration
// ============================================================================

/**
 * @deprecated Use testcases directly from store. This maintains compatibility with old code.
 */
export const useEditorStoreCompat = () => {
  const store = useEditorStore();
  
  return {
    ...store,
    // Legacy aliases
    currentTestCases: store.testcases.map((tc) => ({
      id: tc.id ?? 0,
      questionId: store.currentProblem?.id ?? 0,
      input: tc.input,
      type: "DEFAULT" as const,
    })),
    customTestCases: store.testcases
      .filter((tc) => tc.isUserAdded || tc.isModified)
      .map((tc) => ({ input: JSON.parse(tc.input) })),
    setTestCases: store.initializeTestcases,
    addCustomTestCase: (tc: { input: Record<string, unknown> }) => 
      store.addTestcase(JSON.stringify(tc.input)),
    removeCustomTestCase: store.removeTestcase,
    updateCustomTestCase: (index: number, tc: { input: Record<string, unknown> }) =>
      store.updateTestcaseInput(index, JSON.stringify(tc.input)),
    activeTestCaseTab: "cases" as "cases" | "custom",
    setActiveTestCaseTab: () => {}, // No-op, we don't have tabs anymore
  };
};
