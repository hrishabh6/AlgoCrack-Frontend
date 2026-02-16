/**
 * @deprecated This service is deprecated. Use submission-service.ts instead.
 * The new architecture routes all execution through Submission Service's /run endpoint.
 * CXE is now an internal backend service not directly accessible from frontend.
 */

import { API_URLS, ENDPOINTS } from "../constants";
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

const cxeServiceUrl = API_URLS.EXECUTION;

/**
 * @deprecated Use submission-service.ts runCode() instead
 */
export async function runCode(
  request: LegacyExecutionRequest
): Promise<LegacyExecutionResponse> {
  console.warn("cxe-service.runCode is deprecated. Use submission-service.runCode instead.");
  
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/submit`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to run code: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * @deprecated Direct CXE polling is deprecated
 */
export async function getExecutionStatus(
  submissionId: string
): Promise<LegacyExecutionStatusResponse> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/status/${submissionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get execution status: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * @deprecated Direct CXE results are deprecated
 */
export async function getExecutionResults(
  submissionId: string
): Promise<LegacyExecutionResultsResponse> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/results/${submissionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get execution results: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * @deprecated Direct CXE cancellation is deprecated
 */
export async function cancelExecution(
  submissionId: string
): Promise<{ success: boolean; message: string; submissionId: string }> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/cancel/${submissionId}`;
  
  const response = await fetch(url, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to cancel execution: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check CXE service health (still useful for monitoring)
 */
export async function getHealth(): Promise<HealthResponse> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/health`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get health status: ${response.statusText}`);
  }
  
  return response.json();
}
