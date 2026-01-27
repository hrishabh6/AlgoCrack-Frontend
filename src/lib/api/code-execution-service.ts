// src/lib/api/code-execution-service.ts

/**
 * Calls the Code Execution Engine (CXE) to run user code against test cases.
 *
 * @param payload - Object containing language, source code and test cases.
 * @returns Promise resolving to the execution result.
 */
export async function runCode(payload: {
  language: string;
  source: string;
  testCases: any[];
}): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const response = await fetch(`${baseUrl}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CXE request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
