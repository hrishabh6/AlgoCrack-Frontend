import { API_URLS, ENDPOINTS } from "../constants";
import type {
  ExecutionRequest,
  ExecutionResponse,
  ExecutionStatusResponse,
  ExecutionResultsResponse,
  HealthResponse,
} from "@/types";

const cxeServiceUrl = API_URLS.EXECUTION;

/**
 * Run code against custom test cases (no DB save)
 * This is used for the "Run" button
 */
export async function runCode(
  request: ExecutionRequest
): Promise<ExecutionResponse> {
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
 * Poll execution status
 */
export async function getExecutionStatus(
  submissionId: string
): Promise<ExecutionStatusResponse> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/status/${submissionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get execution status: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get full execution results
 */
export async function getExecutionResults(
  submissionId: string
): Promise<ExecutionResultsResponse> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/results/${submissionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get execution results: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Cancel a queued execution
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
 * Check CXE service health
 */
export async function getHealth(): Promise<HealthResponse> {
  const url = `${cxeServiceUrl}${ENDPOINTS.EXECUTION}/health`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to get health status: ${response.statusText}`);
  }
  
  return response.json();
}
