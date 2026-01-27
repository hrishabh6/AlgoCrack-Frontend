// Code Execution Engine Types (for "Run" feature)

export type ExecutionStatus =
  | "QUEUED"
  | "COMPILING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ExecutionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

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

export interface ExecutionTestCase {
  input: Record<string, unknown>;
  expectedOutput?: unknown;
}

export interface ExecutionRequest {
  submissionId?: string;
  userId: number;
  questionId: number;
  language: string;
  code: string;
  metadata: ExecutionMetadata;
  testCases: ExecutionTestCase[];
}

export interface ExecutionResponse {
  submissionId: string;
  status: ExecutionStatus;
  message: string;
  queuePosition: number;
  estimatedWaitTimeMs: number;
  statusUrl: string;
  resultsUrl: string;
}

export interface ExecutionStatusResponse {
  submissionId: string;
  status: ExecutionStatus;
  verdict?: ExecutionVerdict;
  runtimeMs?: number;
  memoryKb?: number;
  queuePosition: number | null;
  queuedAt: number;
  startedAt: number | null;
  completedAt: number | null;
  workerId: string | null;
}

export interface TestCaseResult {
  index: number;
  passed: boolean;
  actualOutput: string;
  executionTimeMs: number;
  error: string | null;
  errorType?: string | null;
}

export interface ExecutionResultsResponse {
  submissionId: string;
  status: ExecutionStatus;
  verdict: ExecutionVerdict;
  runtimeMs: number;
  compilationOutput: string;
  testCaseResults: TestCaseResult[];
}

export interface HealthResponse {
  status: "UP" | "DOWN";
  queueSize: number;
  activeWorkers: number;
  avgExecutionTimeMs: number;
}
