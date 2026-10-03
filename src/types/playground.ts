export type PlaygroundLanguageCode = "JAVA" | "PYTHON";

export interface PlaygroundSummary {
  id: number;
  title: string;
  language: PlaygroundLanguageCode;
  createdAt: string;
  updatedAt: string;
}

export interface PlaygroundDetail extends PlaygroundSummary {
  sourceCode: string;
  stdin: string;
}

export interface PlaygroundPageResponse {
  content: PlaygroundSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PlaygroundCreateRequest {
  title: string;
  language: PlaygroundLanguageCode;
  sourceCode: string;
  stdin: string;
}

export type PlaygroundUpdateRequest = PlaygroundCreateRequest;

export type PlaygroundRunStatus =
  | "SUCCESS"
  | "COMPILE_ERROR"
  | "RUNTIME_ERROR"
  | "TIME_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export interface PlaygroundRunRequest {
  language: PlaygroundLanguageCode;
  sourceCode: string;
  stdin: string;
}

export interface PlaygroundRunResponse {
  executionId: string;
  status: PlaygroundRunStatus;
  stdout: string;
  stderr: string;
  compilerOutput: string;
  runtimeMs: number | null;
  memoryKb: number | null;
  exitCode: number | null;
  outputTruncated: boolean;
}

export interface LanguageDescriptor {
  code: PlaygroundLanguageCode;
  displayName: string;
  monacoLanguage: string;
  starterSource: string;
}

export interface PlaygroundWorkspaceSnapshot {
  id: number | null;
  title: string;
  language: PlaygroundLanguageCode;
  sourceCode: string;
  stdin: string;
}
