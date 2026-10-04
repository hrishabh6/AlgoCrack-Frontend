import type { ComplexityProcessingStatus, ComplexityResultKind } from "@/types/complexity";

export function complexityStatusLabel(status: ComplexityProcessingStatus): string {
  switch (status) {
    case "QUEUED":
      return "Queued";
    case "STATIC_ANALYZING":
      return "Static analysis";
    case "BENCHMARK_PREPARING":
    case "BENCHMARK_QUEUED":
    case "BENCHMARKING":
      return "Profiling";
    case "RECONCILING":
      return "Reconciling";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

export function complexityResultKindLabel(kind: ComplexityResultKind | null): string {
  switch (kind) {
    case "HYBRID":
      return "Hybrid estimate";
    case "STATIC_ONLY":
      return "Static only";
    case "EMPIRICAL_ONLY":
      return "Empirical only";
    case "INCONCLUSIVE":
      return "Inconclusive";
    case "UNSUPPORTED":
      return "Unsupported";
    default:
      return "Pending";
  }
}

export function limitationLabel(code: string): string {
  const map: Record<string, string> = {
    PROFILE_UNAVAILABLE: "Dynamic profiling is not available for this problem.",
    PROFILE_INFRASTRUCTURE_UNAVAILABLE: "Profiling infrastructure was temporarily unavailable.",
    BENCHMARK_INSUFFICIENT_POINTS: "Not enough benchmark data to infer growth.",
    BENCHMARK_NOISY: "Benchmark measurements were too noisy.",
    MULTI_DIMENSIONAL_INCONCLUSIVE: "Multiple input dimensions vary; growth is inconclusive.",
    PARSER_UNSUPPORTED: "Static analysis could not parse this submission.",
    OPAQUE_CALLS: "Opaque calls limited static reasoning.",
  };
  return map[code] ?? code.replaceAll("_", " ").toLowerCase();
}
