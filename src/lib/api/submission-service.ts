import { API_URLS, ENDPOINTS } from "../constants";

/**
 * Submits user solution to the Submission Service.
 *
 * @param payload - Object containing problemId, language and source code.
 * @returns Promise resolving to the submission result.
 */
export async function submitSolution(payload: {
  userId: number;
  questionId: number;
  language: string;
  code: string;
}): Promise<any> {
  const url = `${API_URLS.SUBMISSION}${ENDPOINTS.SUBMISSIONS}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Submission request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
