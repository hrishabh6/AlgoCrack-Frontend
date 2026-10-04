export type ComplexityProcessingStatus =
  | "QUEUED"
  | "STATIC_ANALYZING"
  | "BENCHMARK_PREPARING"
  | "BENCHMARK_QUEUED"
  | "BENCHMARKING"
  | "RECONCILING"
  | "COMPLETED"
  | "FAILED";

export type ComplexityResultKind =
  | "HYBRID"
  | "STATIC_ONLY"
  | "EMPIRICAL_ONLY"
  | "INCONCLUSIVE"
  | "UNSUPPORTED";

export type ComplexityConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface ComplexityEstimate {
  expression: string | null;
  bigO: string | null;
  boundBasis: string | null;
  confidence: ComplexityConfidence | null;
}

export interface ComplexityVariable {
  name: string;
  meaning: string;
}

export interface ComplexityEvidence {
  staticEvidence: string[];
  dynamic: string[];
  staticEvidenceAvailable: boolean;
  dynamicEvidenceAvailable: boolean;
}

export interface ComplexityVersions {
  analyzer: string | null;
  inference: string | null;
  confidenceModel: string | null;
  knowledgeBase: string | null;
  profile: string | null;
  generator: string | null;
  harness: string | null;
  measurementPolicy: string | null;
}

export interface ComplexityAnalysisRequestResponse {
  analysisId: string;
  submissionId: string;
  status: ComplexityProcessingStatus;
  reused: boolean;
  pollAfterMs: number;
}

export interface ComplexityAnalysisDetail {
  analysisId: string;
  submissionId: string;
  status: ComplexityProcessingStatus;
  resultKind: ComplexityResultKind | null;
  language: string;
  requestedAt: string;
  completedAt: string | null;
  time: ComplexityEstimate | null;
  space: ComplexityEstimate | null;
  variables: ComplexityVariable[];
  evidence: ComplexityEvidence | null;
  limitations: string[];
  versions: ComplexityVersions | null;
  reused: boolean | null;
  reasonCodes: string[];
}
