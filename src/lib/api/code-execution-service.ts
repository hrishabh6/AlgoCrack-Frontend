import { API_URLS, ENDPOINTS } from "../constants";

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
  const url = `${API_URLS.EXECUTION}${ENDPOINTS.EXECUTION}/submit`;
  
  const requestBody: any = {
    questionId: payload.questionId,
    language: payload.language,
    code: payload.code,
  };

  // Include customTestCases if provided
  if (payload.customTestCases && payload.customTestCases.length > 0) {
    requestBody.customTestCases = payload.customTestCases;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CXE request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Get status of an async execution.
 */
export async function getExecutionStatus(submissionId: string): Promise<any> {
  const url = `${API_URLS.EXECUTION}${ENDPOINTS.EXECUTION}/status/${submissionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
     // If not found, it might still be propagating, or failed.
     return null; 
  }
  return response.json();
}

/**
 * Get full results of a completed execution.
 */
export async function getExecutionResults(submissionId: string): Promise<any> {
    const url = `${API_URLS.EXECUTION}${ENDPOINTS.EXECUTION}/results/${submissionId}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
    }
    return response.json();
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
