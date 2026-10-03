"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Difficulty, ProblemSortKey, QuestionFilters, SolveStatusFilter, SortOrder } from "@/types";

export interface ProblemFilterState {
  search: string;
  difficulty: Difficulty | null;
  tags: string[];
  status: SolveStatusFilter | null;
  sort: ProblemSortKey;
  order: SortOrder;
  page: number;
}

export const PAGE_SIZE = 20;

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const SORT_KEYS: ProblemSortKey[] = ["id", "title", "difficulty"];

function parseTags(params: URLSearchParams): string[] {
  const raw = [params.get("tags") ?? "", params.get("tag") ?? ""].join(",");
  return [...new Set(raw.split(",").map((t) => t.trim()).filter((t) => t && t !== "all"))];
}

export function parseProblemFilters(params: URLSearchParams): ProblemFilterState {
  const difficulty = params.get("difficulty");
  const status = params.get("status");
  const sort = params.get("sort");
  return {
    search: params.get("search") ?? "",
    difficulty: DIFFICULTIES.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : null,
    tags: parseTags(params),
    status: status === "solved" || status === "unsolved" ? status : null,
    sort: SORT_KEYS.includes(sort as ProblemSortKey) ? (sort as ProblemSortKey) : "id",
    order: params.get("order") === "desc" ? "desc" : "asc",
    page: Math.max(0, Number(params.get("page")) || 0),
  };
}

export function toQuestionFilters(state: ProblemFilterState, canUseStatus: boolean): QuestionFilters {
  return {
    page: state.page,
    size: PAGE_SIZE,
    search: state.search || undefined,
    difficulty: state.difficulty ?? undefined,
    tags: state.tags.length > 0 ? state.tags : undefined,
    sort: state.sort,
    order: state.order,
    status: canUseStatus && state.status ? state.status : undefined,
  };
}

export function hasActiveFilters(state: ProblemFilterState): boolean {
  return Boolean(state.search || state.difficulty || state.tags.length > 0 || state.status);
}

function serialize(state: ProblemFilterState): string {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search);
  if (state.difficulty) params.set("difficulty", state.difficulty);
  if (state.tags.length > 0) params.set("tags", state.tags.join(","));
  if (state.status) params.set("status", state.status);
  if (state.sort !== "id") params.set("sort", state.sort);
  if (state.order !== "asc") params.set("order", state.order);
  if (state.page > 0) params.set("page", String(state.page));
  return params.toString();
}

/**
 * Problems-page filter state, stored in the URL so it is refresh-safe, shareable and works with
 * browser back/forward. Any change other than paging resets to the first page.
 */
export function useProblemFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const filters = useMemo(() => parseProblemFilters(new URLSearchParams(queryString)), [queryString]);

  const navigate = useCallback(
    (next: ProblemFilterState, { replace = false } = {}) => {
      const qs = serialize(next);
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [pathname, router]
  );

  const setFilters = useCallback(
    (patch: Partial<ProblemFilterState>, options?: { replace?: boolean }) => {
      const resetsPage = Object.keys(patch).some((k) => k !== "page");
      navigate({ ...filters, ...patch, ...(resetsPage && patch.page === undefined ? { page: 0 } : {}) }, options);
    },
    [filters, navigate]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const tags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
      setFilters({ tags });
    },
    [filters.tags, setFilters]
  );

  const resetFilters = useCallback(() => {
    navigate({ ...filters, search: "", difficulty: null, tags: [], status: null, page: 0 });
  }, [filters, navigate]);

  const pageHref = useCallback(
    (page: number) => {
      const qs = serialize({ ...filters, page });
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [filters, pathname]
  );

  return { filters, setFilters, toggleTag, resetFilters, pageHref };
}
