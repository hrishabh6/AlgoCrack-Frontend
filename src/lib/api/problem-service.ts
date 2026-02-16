import { API_URLS, ENDPOINTS } from "../constants";
import type {
  QuestionSummary,
  QuestionDetail,
  TestCase,
  Solution,
  Tag,
  PaginatedResponse,
  QuestionFilters,
} from "@/types";

const problemServiceUrl = API_URLS.PROBLEM;

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
  
  const url = `${problemServiceUrl}${ENDPOINTS.QUESTIONS}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch a single question by ID
 */
export async function getQuestionById(id: number): Promise<QuestionDetail> {
  const url = `${problemServiceUrl}${ENDPOINTS.QUESTIONS}/${id}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch question: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch all tags
 */
export async function getTags(): Promise<Tag[]> {
  const url = `${problemServiceUrl}${ENDPOINTS.TAGS}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch test cases for a question (visible only)
 */
export async function getTestCases(questionId: number): Promise<TestCase[]> {
  const url = `${problemServiceUrl}${ENDPOINTS.TEST_CASES}/question/${questionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch test cases: ${response.statusText}`);
  }
  
  const testCases: TestCase[] = await response.json();
  // Filter to only show DEFAULT (non-hidden) test cases
  return testCases.filter((tc) => tc.type === "DEFAULT");
}

/**
 * Fetch solutions for a question
 */
export async function getSolutions(questionId: number): Promise<Solution[]> {
  const url = `${problemServiceUrl}${ENDPOINTS.SOLUTIONS}/question/${questionId}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch solutions: ${response.statusText}`);
  }
  
  return response.json();
}
