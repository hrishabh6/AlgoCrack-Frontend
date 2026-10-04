import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";
import { normalizeUnknownError } from "../error-utils";
import type {
  ComplexityAnalysisDetail,
  ComplexityAnalysisRequestResponse,
} from "@/types/complexity";

const base = (submissionId: string) =>
  `${ENDPOINTS.SUBMISSIONS}/${submissionId}/complexity-analyses`;

export async function requestComplexityAnalysis(
  submissionId: string
): Promise<ComplexityAnalysisRequestResponse> {
  try {
    return await apiClient.post<ComplexityAnalysisRequestResponse>(base(submissionId), {});
  } catch (error) {
    throw normalizeUnknownError(error, "Failed to request complexity analysis");
  }
}

export async function getComplexityAnalysisDetail(
  submissionId: string,
  analysisId: string
): Promise<ComplexityAnalysisDetail> {
  try {
    return await apiClient.get<ComplexityAnalysisDetail>(`${base(submissionId)}/${analysisId}`);
  } catch (error) {
    throw normalizeUnknownError(error, "Failed to load complexity analysis");
  }
}

export async function pollComplexityAnalysisDetail(
  submissionId: string,
  analysisId: string,
  options?: { maxAttempts?: number; intervalMs?: number; signal?: AbortSignal }
): Promise<ComplexityAnalysisDetail> {
  const maxAttempts = options?.maxAttempts ?? 120;
  const intervalMs = options?.intervalMs ?? 1500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (options?.signal?.aborted) {
      throw new Error("Complexity analysis polling cancelled");
    }
    const detail = await getComplexityAnalysisDetail(submissionId, analysisId);
    if (detail.status === "COMPLETED" || detail.status === "FAILED") {
      return detail;
    }
    await sleep(intervalMs, options?.signal);
  }
  throw new Error("Complexity analysis timed out. Try again later.");
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("Complexity analysis polling cancelled"));
      },
      { once: true }
    );
  });
}
