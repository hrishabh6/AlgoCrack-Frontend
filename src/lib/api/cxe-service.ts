/**
 * @deprecated This service is deprecated. Use submission-service.ts instead.
 * The new architecture routes all execution through Submission Service's /run endpoint.
 * CXE is now an internal backend service not directly accessible from frontend.
 */

import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";
import type { HealthResponse } from "@/types";

// Legacy types for backward compatibility
interface LegacyExecutionRequest {
  submissionId?: string;
  userId?: number;
  questionId: number;
  language: string;
  code: string;
  testCases?: Array<{ input: Record<string, unknown> }>;
}

interface LegacyExecutionResponse {
  submissionId: string;
  status: string;
  message: string;
}

interface LegacyExecutionStatusResponse {
  submissionId: string;
  status: string;
  verdict?: string;
  runtimeMs?: number;
  memoryKb?: number;
}

interface LegacyExecutionResultsResponse {
  submissionId: string;
  status: string;
  verdict: string;
  runtimeMs: number;
  testCaseResults: Array<{
    index: number;
    passed: boolean;
    actualOutput: string;
    executionTimeMs: number;
    error: string | null;
  }>;
}

/**
 * @deprecated Use submission-service.ts runCode() instead
 */
export async function runCode(
  request: LegacyExecutionRequest
): Promise<LegacyExecutionResponse> {
  console.warn("cxe-service.runCode is deprecated. Use submission-service.runCode instead.");
  
  // Note: This endpoint might not exist on Gateway if CXE is internal only.
  // But keeping it consistent with valid URL construction just in case.
  // Ideally this function should be removed or redirect to submission service logic.
  return apiClient.post<LegacyExecutionResponse>(`${ENDPOINTS.EXECUTION}/submit`, request);
}

/**
 * @deprecated Direct CXE polling is deprecated
 */
export async function getExecutionStatus(
  submissionId: string
): Promise<LegacyExecutionStatusResponse> {
  return apiClient.get<LegacyExecutionStatusResponse>(`${ENDPOINTS.EXECUTION}/status/${submissionId}`);
}

/**
 * @deprecated Direct CXE results are deprecated
 */
export async function getExecutionResults(
  submissionId: string
): Promise<LegacyExecutionResultsResponse> {
  return apiClient.get<LegacyExecutionResultsResponse>(`${ENDPOINTS.EXECUTION}/results/${submissionId}`);
}

/**
 * @deprecated Direct CXE cancellation is deprecated
 */
export async function cancelExecution(
  submissionId: string
): Promise<{ success: boolean; message: string; submissionId: string }> {
  return apiClient.delete<{ success: boolean; message: string; submissionId: string }>(`${ENDPOINTS.EXECUTION}/cancel/${submissionId}`);
}

/**
 * Check CXE service health (still useful for monitoring)
 */
export async function getHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>(`${ENDPOINTS.EXECUTION}/health`);
}
