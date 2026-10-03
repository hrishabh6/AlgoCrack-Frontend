import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";
import type {
  ProblemListDetail,
  ProblemListInput,
  ProblemListSummary,
  ProblemListsOverview,
  Streak,
} from "@/types";

// Every call here is user-specific and must only run for authenticated users:
// apiClient redirects to sign-in on 401.

const BASE = ENDPOINTS.PROBLEM_LISTS;

export function getProblemListsOverview(): Promise<ProblemListsOverview> {
  return apiClient.get<ProblemListsOverview>(BASE);
}

export function createProblemList(input: ProblemListInput): Promise<ProblemListSummary> {
  return apiClient.post<ProblemListSummary>(BASE, input);
}

export function updateProblemList(listId: number, input: ProblemListInput): Promise<ProblemListSummary> {
  return apiClient.patch<ProblemListSummary>(`${BASE}/${listId}`, input);
}

export function deleteProblemList(listId: number): Promise<void> {
  return apiClient.delete<void>(`${BASE}/${listId}`);
}

export function getProblemList(listId: number): Promise<ProblemListDetail> {
  return apiClient.get<ProblemListDetail>(`${BASE}/${listId}`);
}

export function addProblemToList(listId: number, problemId: number): Promise<void> {
  return apiClient.put<void>(`${BASE}/${listId}/problems/${problemId}`, undefined);
}

export function removeProblemFromList(listId: number, problemId: number): Promise<void> {
  return apiClient.delete<void>(`${BASE}/${listId}/problems/${problemId}`);
}

export function getSavedProblems(): Promise<ProblemListDetail> {
  return apiClient.get<ProblemListDetail>(`${BASE}/saved`);
}

export function saveProblem(problemId: number): Promise<void> {
  return apiClient.put<void>(`${BASE}/saved/problems/${problemId}`, undefined);
}

export function unsaveProblem(problemId: number): Promise<void> {
  return apiClient.delete<void>(`${BASE}/saved/problems/${problemId}`);
}

export function getMySolvedQuestionIds(): Promise<number[]> {
  return apiClient.get<number[]>(ENDPOINTS.MY_SOLVED_IDS);
}

export function getStreak(userId: string): Promise<Streak> {
  return apiClient.get<Streak>(`${ENDPOINTS.USER_STREAK}/${encodeURIComponent(userId)}`);
}
