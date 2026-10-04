import type { SubmitVerdict, ExecutionStatus } from "@/types/execution";

export function isComplexityAnalysisEligible(input: {
  verdict: SubmitVerdict | null;
  status: ExecutionStatus;
  language: string;
}): boolean {
  if (input.verdict !== "ACCEPTED" || input.status !== "COMPLETED") {
    return false;
  }
  return input.language.trim().toLowerCase() === "java";
}
