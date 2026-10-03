import { ENDPOINTS } from "../constants";
import { apiClient, serverApiClient } from "../api-client";
import type {
  QuestionSummary,
  QuestionDetail,
  TestCase,
  Solution,
  Tag,
  TagCount,
  PaginatedResponse,
  QuestionFilters,
} from "@/types";

/**
 * Fetch paginated list of questions with filters.
 * A `status` filter needs the caller's identity, so it is served by the authenticated
 * /api/v1/user/me/questions endpoint instead of the public listing.
 */
export async function getQuestions(
  filters: QuestionFilters = {}
): Promise<PaginatedResponse<QuestionSummary>> {
  const params = new URLSearchParams();

  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.size !== undefined) params.set("size", String(filters.size));
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.excludeDifficulty) params.set("excludeDifficulty", filters.excludeDifficulty);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.tags && filters.tags.length > 0) params.set("tags", filters.tags.join(","));
  if (filters.excludeTags && filters.excludeTags.length > 0) params.set("excludeTags", filters.excludeTags.join(","));
  if (filters.search) params.set("search", filters.search);
  if (filters.company) params.set("company", filters.company);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);

  if (filters.status) {
    params.set("status", filters.status);
    return apiClient.get<PaginatedResponse<QuestionSummary>>(
      `${ENDPOINTS.MY_QUESTIONS}?${params.toString()}`
    );
  }

  return serverApiClient.get<PaginatedResponse<QuestionSummary>>(
    `${ENDPOINTS.QUESTIONS}?${params.toString()}`
  );
}

/**
 * Fetch every tag with the number of problems using it, most used first.
 */
export async function getTagCounts(): Promise<TagCount[]> {
  return serverApiClient.get<TagCount[]>(`${ENDPOINTS.TAGS}/counts`);
}

/**
 * Fetch a single question by ID
 */
export async function getQuestionById(id: number): Promise<QuestionDetail> {
  return serverApiClient.get<QuestionDetail>(`${ENDPOINTS.QUESTIONS}/${id}`);
}

/**
 * Fetch all tags
 */
export async function getTags(): Promise<Tag[]> {
  return serverApiClient.get<Tag[]>(`${ENDPOINTS.TAGS}`);
}

/**
 * Fetch test cases for a question (visible only)
 */
export async function getTestCases(questionId: number): Promise<TestCase[]> {
    const testCases = await serverApiClient.get<TestCase[]>(`${ENDPOINTS.TEST_CASES}/question/${questionId}`);
  // Filter to only show DEFAULT (non-hidden) test cases
  return testCases.filter((tc) => tc.type === "DEFAULT");
}

/**
 * Fetch solutions for a question
 */
export async function getSolutions(questionId: number): Promise<Solution[]> {
  return serverApiClient.get<Solution[]>(`${ENDPOINTS.SOLUTIONS}/question/${questionId}`);
}
