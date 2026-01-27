import { API_URLS, ENDPOINTS } from "../constants";
import type {
  SubmissionRequest,
  SubmissionResponse,
  SubmissionDetail,
} from "@/types";

const submissionServiceUrl = API_URLS.SUBMISSION;

/**
 * Submit code for evaluation (saves to DB, runs against all test cases)
 */
export async function submitCode(
  request: SubmissionRequest
): Promise<SubmissionResponse> {
  const url = `${submissionServiceUrl}${ENDPOINTS.SUBMISSIONS}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to submit code: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get submission details by ID
 */
export async function getSubmission(
  submissionId: string
): Promise<SubmissionDetail> {
  const url = `${submissionServiceUrl}${ENDPOINTS.SUBMISSIONS}/${submissionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch submission: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get user's submission history
 */
export async function getUserSubmissions(
  userId: number,
  page = 0,
  size = 20
): Promise<SubmissionDetail[]> {
  const url = `${submissionServiceUrl}${ENDPOINTS.SUBMISSIONS}/user/${userId}?page=${page}&size=${size}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user submissions: ${response.statusText}`);
  }
  
  return response.json();
}
