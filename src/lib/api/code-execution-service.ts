import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";

/**
 * Calls the Code Execution Engine (CXE) to run user code against test cases.
 *
 * @param payload - Object containing language, source code and test cases.
 * @returns Promise resolving to the execution result.
 */
export async function runCode(payload: {
  questionId: number;
  language: string;
  code: string;
  customTestCases?: any[];
}): Promise<any> {
  // Use the standalone CXE service URL
  // Matches ExecutionController @RequestMapping("/api/v1/execution") + @PostMapping("/submit")
  
  const requestBody: any = {
    questionId: payload.questionId,
    language: payload.language,
    code: payload.code,
  };

  // Include customTestCases if provided
  if (payload.customTestCases && payload.customTestCases.length > 0) {
    requestBody.customTestCases = payload.customTestCases;
  }

  return apiClient.post<any>(`${ENDPOINTS.EXECUTION}/submit`, requestBody);
}

/**
 * Get status of an async execution.
 */
export async function getExecutionStatus(submissionId: string): Promise<any> {
  try {
    return await apiClient.get<any>(`${ENDPOINTS.EXECUTION}/status/${submissionId}`);
  } catch (error) {
     // If not found, it might still be propagating, or failed.
     // Previous code returned null on 404 (implied by response.ok check assumption/comment)
     // Let's safe guard.
     return null;
  }
}

/**
 * Get full results of a completed execution.
 */
export async function getExecutionResults(submissionId: string): Promise<any> {
    return apiClient.get<any>(`${ENDPOINTS.EXECUTION}/results/${submissionId}`);
}

/**
 * Polls for execution completion.
 */
export async function pollExecution(submissionId: string, maxAttempts = 20, intervalMs = 500): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, intervalMs));
        const status = await getExecutionStatus(submissionId);
        
        if (status && (status.status === "COMPLETED" || status.status === "FAILED" || status.status === "ERROR")) {
            // Fetch full results if completed
            if (status.status === "COMPLETED" || status.status === "ERROR" || status.status === "FAILED") {
                 return getExecutionResults(submissionId);
            }
             // For simple failure/error without results endpoint data (if any), return status
             return status;
        }
    }
    throw new Error("Execution timed out");
}
