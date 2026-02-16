import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";
import type {
  QuestionSummary,
  QuestionDetail,
  TestCase,
  Solution,
  Tag,
  PaginatedResponse,
  QuestionFilters,
} from "@/types";

/**
 * Fetch paginated list of questions with filters
 */
export async function getQuestions(
  filters: QuestionFilters = {}
): Promise<PaginatedResponse<QuestionSummary>> {
  const params = new URLSearchParams();
  
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.size !== undefined) params.set("size", String(filters.size));
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.search) params.set("search", filters.search);
  if (filters.company) params.set("company", filters.company);
  
  return apiClient.get<PaginatedResponse<QuestionSummary>>(
    `${ENDPOINTS.QUESTIONS}?${params.toString()}`
  );
}

/**
 * Fetch a single question by ID
 */
export async function getQuestionById(id: number): Promise<QuestionDetail> {
  return apiClient.get<QuestionDetail>(`${ENDPOINTS.QUESTIONS}/${id}`);
}

/**
 * Fetch all tags
 */
export async function getTags(): Promise<Tag[]> {
  return apiClient.get<Tag[]>(`${ENDPOINTS.TAGS}`);
}

/**
 * Fetch test cases for a question (visible only)
 */
export async function getTestCases(questionId: number): Promise<TestCase[]> {
    const testCases = await apiClient.get<TestCase[]>(`${ENDPOINTS.TEST_CASES}/question/${questionId}`);
  // Filter to only show DEFAULT (non-hidden) test cases
  return testCases.filter((tc) => tc.type === "DEFAULT");
}

/**
 * Fetch solutions for a question
 */
export async function getSolutions(questionId: number): Promise<Solution[]> {
  return apiClient.get<Solution[]>(`${ENDPOINTS.SOLUTIONS}/question/${questionId}`);
}
