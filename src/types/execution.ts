// Code Execution & Submission Types - v2.0
// Updated for oracle-based judging and RUN vs SUBMIT separation

// ============================================================================
// Status Types
// ============================================================================

export type ExecutionStatus =
  | "PENDING"
  | "QUEUED"
  | "COMPILING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// ============================================================================
// Verdict Types - RUN vs SUBMIT separation
// ============================================================================

/**
 * RUN Verdicts - Used for testing against visible testcases.
 * These are "soft" verdicts for iteration purposes.
 */
export type RunVerdict =
  | "PASSED_RUN"
  | "FAILED_RUN"
  | "COMPILATION_ERROR_RUN"
  | "RUNTIME_ERROR_RUN"
  | "TIMEOUT_RUN"
  | "MEMORY_LIMIT_RUN"
  | "INTERNAL_ERROR_RUN";

/**
 * SUBMIT Verdicts - Used for official judging against hidden testcases.
 * These are authoritative verdicts that affect user stats.
 */
export type SubmitVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR"
  | "MEMORY_LIMIT_EXCEEDED";

/** Combined verdict type for store usage */
export type Verdict = RunVerdict | SubmitVerdict;

// ============================================================================
// Metadata Types
// ============================================================================

export interface ParameterMetadata {
  name: string;
  type: string;
}

export interface ExecutionMetadata {
  functionName: string;
  returnType: string;
  parameters: ParameterMetadata[];
  customDataStructures?: Record<string, string>;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request payload for /run endpoint (synchronous).
 * Frontend sends testcases directly - no distinction between default/custom.
 * Note: Field name is `customTestCases` to match backend RunRequestDto.
 */
export interface RunRequest {
  questionId: number;
  language: string;
  code: string;
  customTestCases: Array<{ input: string }>;
}

/**
 * Request payload for /submit endpoint (async).
 * Backend uses HIDDEN testcases from DB.
 */
export interface SubmitRequest {
  userId: string;
  questionId: number;
  language: string;
  code: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Individual testcase result from execution.
 * Now includes expectedOutput from oracle comparison.
 */
export interface TestCaseResult {
  index: number;
  passed: boolean | null;  // null when not yet judged (CXE raw output)
  actualOutput: string;
  expectedOutput?: string;  // From oracle, optional
  executionTimeMs: number;
  memoryBytes?: number;
  error: string | null;
  errorType?: string | null;
  /** @deprecated Will be removed - use unified testcase model */
  isCustom?: boolean;
}

/**
 * Response from /run endpoint (synchronous).
 */
export interface RunResponse {
  verdict: RunVerdict;
  success: boolean;
  runtimeMs: number;
  memoryKb: number;
  compilationOutput: string | null;
  errorMessage: string | null;
  testCaseResults: TestCaseResult[] | null;
}

/**
 * Initial response from /submit endpoint.
 */
export interface SubmitResponse {
  submissionId: string;
  status: ExecutionStatus;
  message: string;
}

/**
 * Complete submission details (from polling or WebSocket).
 */
export interface SubmissionDetail {
  submissionId: string;
  userId: string;
  questionId: number;
  language: string;
  code: string;
  status: ExecutionStatus;
  verdict: SubmitVerdict | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  passedTestCases: number | null;
  totalTestCases: number | null;
  errorMessage: string | null;
  compilationOutput?: string | null;
  testCaseResults?: TestCaseResult[];
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WebSocketStatusUpdate {
  submissionId: string;
  status: ExecutionStatus;
}

export interface WebSocketFinalResult {
  submissionId: string;
  status: "COMPLETED";
  verdict: SubmitVerdict;
  runtimeMs: number;
  memoryKb: number;
  passedTestCases: number;
  totalTestCases: number;
}

export interface WebSocketError {
  submissionId: string;
  status: "FAILED";
  error: string;
}

export type WebSocketMessage =
  | WebSocketStatusUpdate
  | WebSocketFinalResult
  | WebSocketError;

// ============================================================================
// Health Check
// ============================================================================

export interface HealthResponse {
  status: "UP" | "DOWN";
  queueSize: number;
  activeWorkers: number;
  avgExecutionTimeMs: number;
}

// ============================================================================
// Verdict Display Helpers
// ============================================================================

export interface VerdictDisplay {
  label: string;
  color: "green" | "red" | "orange" | "blue" | "gray";
  isSuccess: boolean;
}

export const VERDICT_DISPLAY: Record<Verdict, VerdictDisplay> = {
  // RUN verdicts
  PASSED_RUN: { label: "All Tests Passed", color: "green", isSuccess: true },
  FAILED_RUN: { label: "Wrong Answer", color: "red", isSuccess: false },
  COMPILATION_ERROR_RUN: { label: "Compilation Error", color: "orange", isSuccess: false },
  RUNTIME_ERROR_RUN: { label: "Runtime Error", color: "orange", isSuccess: false },
  TIMEOUT_RUN: { label: "Time Limit Exceeded", color: "orange", isSuccess: false },
  MEMORY_LIMIT_RUN: { label: "Memory Limit Exceeded", color: "orange", isSuccess: false },
  INTERNAL_ERROR_RUN: { label: "Internal Error", color: "red", isSuccess: false },
  
  // SUBMIT verdicts
  ACCEPTED: { label: "Accepted", color: "green", isSuccess: true },
  WRONG_ANSWER: { label: "Wrong Answer", color: "red", isSuccess: false },
  TIME_LIMIT_EXCEEDED: { label: "Time Limit Exceeded", color: "orange", isSuccess: false },
  RUNTIME_ERROR: { label: "Runtime Error", color: "orange", isSuccess: false },
  COMPILATION_ERROR: { label: "Compilation Error", color: "orange", isSuccess: false },
  MEMORY_LIMIT_EXCEEDED: { label: "Memory Limit Exceeded", color: "orange", isSuccess: false },
};
