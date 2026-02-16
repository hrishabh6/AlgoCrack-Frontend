// Submission Service Types - v2.0
// Re-exports core types from execution.ts for backward compatibility

export type {
  ExecutionStatus as SubmissionStatus,
  SubmitVerdict as SubmissionVerdict,
  SubmitRequest as SubmissionRequest,
  SubmitResponse as SubmissionResponse,
  SubmissionDetail,
  WebSocketStatusUpdate,
  WebSocketFinalResult,
  WebSocketError,
  WebSocketMessage,
  RunRequest,
  RunResponse,
  TestCaseResult,
} from "./execution";

// Re-export verdict helpers
export { VERDICT_DISPLAY } from "./execution";
