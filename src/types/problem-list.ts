// Problem lists & discovery types — ProblemService /api/v1/problem-lists, /api/v1/tags/counts,
// /api/v1/user/me/*, /api/v1/user/streak/{userId}

import type { QuestionSummary } from "./problem";

export interface TagCount {
  id: number;
  name: string;
  problemCount: number;
}

export interface ProblemListSummary {
  id: number;
  name: string;
  description: string | null;
  problemCount: number;
  /** Most recently added first. */
  problemIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProblemListsOverview {
  saved: {
    problemCount: number;
    problemIds: number[];
  };
  lists: ProblemListSummary[];
}

export interface ProblemListDetail {
  /** null for the built-in Saved collection. */
  id: number | null;
  name: string;
  description: string | null;
  builtIn: boolean;
  problemCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  problems: QuestionSummary[];
}

export interface ProblemListInput {
  name?: string;
  description?: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
  lastActiveDate: string | null;
  totalActiveDays: number;
}

export type ProblemSortKey = "id" | "title" | "difficulty";
export type SortOrder = "asc" | "desc";
export type SolveStatusFilter = "solved" | "unsolved";
