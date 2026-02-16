import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";
import type { RunRequest, RunResponse, SubmitRequest, SubmitResponse, SubmissionDetail } from "@/types";

// ============================================================================
// RUN Code (Synchronous) - New v2 endpoint
// ============================================================================

/**
 * Run code against provided testcases (synchronous).
 * Backend computes expected output via oracle and compares.
 * 
 * @param payload - Request containing code and testcases
 * @returns Promise resolving to run results with verdict
 */
export async function runCode(payload: RunRequest): Promise<RunResponse> {
  return apiClient.post<RunResponse>(`${ENDPOINTS.SUBMISSIONS}/run`, payload);
}

// ============================================================================
// SUBMIT Code (Async) - Official judging
// ============================================================================

/**
 * Submit code for official judging against hidden testcases.
 * Returns immediately with submissionId; poll or use WebSocket for results.
 * 
 * @param payload - Submission request with user code
 * @returns Promise resolving to submission acknowledgment
 */
export async function submitSolution(payload: SubmitRequest): Promise<SubmitResponse> {
  return apiClient.post<SubmitResponse>(`${ENDPOINTS.SUBMISSIONS}`, payload);
}

// ============================================================================
// Polling & Status
// ============================================================================

/**
 * Get details of a specific submission.
 */
export async function getSubmission(submissionId: string): Promise<SubmissionDetail | null> {
  try {
    return await apiClient.get<SubmissionDetail>(`${ENDPOINTS.SUBMISSIONS}/${submissionId}`);
  } catch (error) {
    // If it's a 404/Null return from API client (though apiClient throws on 404 by default usually, unless modified)
    // We need to check if apiClient throws on 404 or how we handle it. 
    // The previous implementation utilized response.ok check. 
    // Let's assume apiClient throws an error for non-2xx.
    // We might want to catch it or let it propagate. 
    // For now, let's propagate as it simplifies logic, but the previous code returned null on 404.
    // If we want to keep that behavior, we'd need to modify apiClient or handle it here.
    // Let's just propagate for now as standard practice.
    throw error;
  }
}

/**
 * Poll for submission completion.
 * 
 * @param submissionId - The submission ID to poll
 * @param maxAttempts - Maximum polling attempts (default: 30)
 * @param intervalMs - Polling interval in ms (default: 1000)
 */
export async function pollSubmission(
  submissionId: string,
  maxAttempts = 30,
  intervalMs = 1000
): Promise<SubmissionDetail> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    
    try {
      const submission = await apiClient.get<SubmissionDetail>(`${ENDPOINTS.SUBMISSIONS}/${submissionId}`);
      
      if (submission && (submission.status === "COMPLETED" || submission.status === "FAILED")) {
        return submission;
      }
    } catch (e) {
      // Ignore transient errors during polling
      console.warn("Polling error:", e);
    }
  }
  
  throw new Error("Submission timed out. Please check back later.");
}

// ============================================================================
// Submission History
// ============================================================================

/**
 * Get user's submission history for a question.
 */
export async function getUserSubmissions(
  userId: number,
  questionId?: number,
  page = 0,
  size = 20
): Promise<SubmissionDetail[]> {
  let url = `${ENDPOINTS.SUBMISSIONS}/user/${userId}?page=${page}&size=${size}`;
  
  if (questionId) {
    url += `&questionId=${questionId}`;
  }
  
  return apiClient.get<SubmissionDetail[]>(url);
}

// ============================================================================
// DEPRECATED - Use runCode instead
// ============================================================================

/**
 * @deprecated Use runCode() instead. This endpoint will be removed in v3.0.
 */
export async function executeCustomTestCases(payload: {
  questionId: number;
  language: string;
  code: string;
  testCases: Array<{ input: string }>;
}): Promise<any> {
  console.warn("executeCustomTestCases is deprecated. Use runCode() instead.");
  
  // Convert to new runCode format
  return runCode({
    questionId: payload.questionId,
    language: payload.language,
    code: payload.code,
    customTestCases: payload.testCases, 
  });
}
