// Submission Service Types

export type SubmissionStatus =
  | "PENDING"
  | "COMPILING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

export interface SubmissionRequest {
  userId: number;
  questionId: number;
  language: string;
  code: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SubmissionResponse {
  submissionId: string;
  status: SubmissionStatus;
  message: string;
}

export interface SubmissionDetail {
  submissionId: string;
  userId: number;
  questionId: number;
  language: string;
  code: string;
  status: SubmissionStatus;
  verdict: SubmissionVerdict | null;
  runtimeMs: number | null;
  memoryKb: number | null;
  passedTestCases: number | null;
  totalTestCases: number | null;
  errorMessage: string | null;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface WebSocketStatusUpdate {
  submissionId: string;
  status: SubmissionStatus;
}

export interface WebSocketFinalResult {
  submissionId: string;
  status: "COMPLETED";
  verdict: SubmissionVerdict;
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
