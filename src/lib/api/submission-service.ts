import { API_URLS, ENDPOINTS } from "../constants";
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
  const url = `${API_URLS.SUBMISSION}${ENDPOINTS.SUBMISSIONS}/run`;
  
  console.log('=== runCode API Call ===' );
  console.log('URL:', url);
  console.log('Request Payload:', JSON.stringify(payload, null, 2));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log('Response Status:', response.status);
  console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

  // Handle rate limiting
  if (response.status === 429) {
    throw new Error("Rate limit exceeded. Please wait before trying again.");
  }

  // Handle validation errors
  if (response.status === 400) {
    const errorText = await response.text();
    console.error('Validation Error Response:', errorText);
    throw new Error(`Validation error: ${errorText}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error Response:', errorText);
    throw new Error(`Run failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('=== Backend Response (Raw) ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('Response Keys:', Object.keys(data));
  console.log('verdict:', data.verdict);
  console.log('status:', data.status);
  console.log('testCaseResults:', data.testCaseResults);
  console.log('results:', data.results);
  console.log('compilationOutput:', data.compilationOutput);
  console.log('errorMessage:', data.errorMessage);
  console.log('=== End Backend Response ===');
  
  return data;
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
  const url = `${API_URLS.SUBMISSION}${ENDPOINTS.SUBMISSIONS}`;
  
  console.log('=== submitSolution API Call ===');
  console.log('URL:', url);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log('submitSolution Response Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('submitSolution Error:', errorText);
    throw new Error(`Submission failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('submitSolution Response:', JSON.stringify(data, null, 2));
  return data;
}

// ============================================================================
// Polling & Status
// ============================================================================

/**
 * Get details of a specific submission.
 */
export async function getSubmission(submissionId: string): Promise<SubmissionDetail | null> {
  const url = `${API_URLS.SUBMISSION}${ENDPOINTS.SUBMISSIONS}/${submissionId}`;
  
  console.log('getSubmission URL:', url);
  
  const response = await fetch(url);

  console.log('getSubmission Status:', response.status);

  if (!response.ok) {
    if (response.status === 404) {
      console.log('getSubmission: 404 - not found yet');
      return null; // Not found or propagation delay
    }
    throw new Error(`Failed to get submission: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('getSubmission Response:', JSON.stringify(data, null, 2));
  return data;
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
  console.log('=== pollSubmission Started ===');
  console.log('submissionId:', submissionId);
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Poll attempt ${i + 1}/${maxAttempts}`);
    await new Promise(r => setTimeout(r, intervalMs));
    
    const submission = await getSubmission(submissionId);
    
    if (submission && (submission.status === "COMPLETED" || submission.status === "FAILED")) {
      console.log('=== pollSubmission Complete ===');
      console.log('Final submission:', JSON.stringify(submission, null, 2));
      return submission;
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
  let url = `${API_URLS.SUBMISSION}${ENDPOINTS.SUBMISSIONS}/user/${userId}?page=${page}&size=${size}`;
  
  if (questionId) {
    url += `&questionId=${questionId}`;
  }
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to get submissions: ${response.status}`);
  }
  
  return response.json();
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
