import { create } from "zustand";
import type {
  SubmissionStatus,
  SubmissionVerdict,
  SubmissionDetail,
  TestCaseResult,
  ExecutionStatus,
  ExecutionVerdict,
} from "@/types";

interface SubmissionState {
  // Current submission state
  isSubmitting: boolean;
  isRunning: boolean;
  currentSubmissionId: string | null;
  
  // Submission status
  submissionStatus: SubmissionStatus | ExecutionStatus | null;
  verdict: SubmissionVerdict | ExecutionVerdict | null;
  
  // Results
  runtimeMs: number | null;
  memoryKb: number | null;
  passedTestCases: number | null;
  totalTestCases: number | null;
  errorMessage: string | null;
  compilationOutput: string | null;
  testCaseResults: TestCaseResult[];
  
  // Submission history
  submissionHistory: SubmissionDetail[];
  
  // Actions
  startSubmission: (submissionId: string) => void;
  startRun: (submissionId: string) => void;
  updateStatus: (status: SubmissionStatus | ExecutionStatus) => void;
  setResults: (results: {
    verdict: SubmissionVerdict | ExecutionVerdict;
    runtimeMs?: number;
    memoryKb?: number;
    passedTestCases?: number;
    totalTestCases?: number;
    errorMessage?: string;
    compilationOutput?: string;
    testCaseResults?: TestCaseResult[];
  }) => void;
  setError: (error: string) => void;
  setHistory: (history: SubmissionDetail[]) => void;
  reset: () => void;
}

const initialState = {
  isSubmitting: false,
  isRunning: false,
  currentSubmissionId: null,
  submissionStatus: null,
  verdict: null,
  runtimeMs: null,
  memoryKb: null,
  passedTestCases: null,
  totalTestCases: null,
  errorMessage: null,
  compilationOutput: null,
  testCaseResults: [],
  submissionHistory: [],
};

export const useSubmissionStore = create<SubmissionState>((set) => ({
  ...initialState,
  
  startSubmission: (submissionId) =>
    set({
      isSubmitting: true,
      isRunning: false,
      currentSubmissionId: submissionId,
      submissionStatus: "PENDING",
      verdict: null,
      errorMessage: null,
      testCaseResults: [],
    }),
  
  startRun: (submissionId) =>
    set({
      isSubmitting: false,
      isRunning: true,
      currentSubmissionId: submissionId,
      submissionStatus: "QUEUED",
      verdict: null,
      errorMessage: null,
      testCaseResults: [],
    }),
  
  updateStatus: (status) =>
    set({ submissionStatus: status }),
  
  setResults: (results) =>
    set({
      isSubmitting: false,
      isRunning: false,
      submissionStatus: "COMPLETED",
      verdict: results.verdict,
      runtimeMs: results.runtimeMs ?? null,
      memoryKb: results.memoryKb ?? null,
      passedTestCases: results.passedTestCases ?? null,
      totalTestCases: results.totalTestCases ?? null,
      errorMessage: results.errorMessage ?? null,
      compilationOutput: results.compilationOutput ?? null,
      testCaseResults: results.testCaseResults ?? [],
    }),
  
  setError: (error) =>
    set({
      isSubmitting: false,
      isRunning: false,
      submissionStatus: "FAILED",
      errorMessage: error,
    }),
  
  setHistory: (history) =>
    set({ submissionHistory: history }),
  
  reset: () => set(initialState),
}));
