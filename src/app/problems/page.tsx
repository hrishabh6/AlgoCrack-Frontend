"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { RotateCcw, SearchX } from "lucide-react";
import { getQuestions, getTagCounts } from "@/lib/api/problem-service";
import { useAuth } from "@/context/AuthContext";
import { ProblemsTable, ProblemsTableSkeleton } from "@/components/problems/problems-table";
import { ProblemsToolbar } from "@/components/problems/problems-toolbar";
import { ProblemsPagination } from "@/components/problems/problems-pagination";
import { TopicChips } from "@/components/problems/topic-chips";
import { LibraryLayout } from "@/components/problems/library-sidebar";
import { hasActiveFilters, toQuestionFilters, useProblemFilters } from "@/components/problems/use-problem-filters";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";
import { useUserProgressStore } from "@/store/useUserProgressStore";
import { ProblemsRail } from "@/components/problems/problems-rail";
import { problemPath } from "@/lib/slug-utils";
import { useRouter } from "next/navigation";
import type { PaginatedResponse, QuestionSummary, TagCount } from "@/types";

interface QueryResult {
  key: string;
  data: PaginatedResponse<QuestionSummary> | null;
  error: string | null;
}

function ProblemsPageContent() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const { filters, setFilters, toggleTag, resetFilters, pageHref } = useProblemFilters();
  const libraryStatus = useProblemLibraryStore((s) => s.status);
  const solvedIdList = useProblemLibraryStore((s) => s.solvedIds);

  const [result, setResult] = useState<QueryResult | null>(null);
  const [tags, setTags] = useState<TagCount[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const waitingForAuth = Boolean(filters.status) && authLoading;
  const questionFilters = useMemo(
    () => toQuestionFilters(filters, isAuthenticated),
    [filters, isAuthenticated]
  );
  const requestKey = `${JSON.stringify(questionFilters)}#${reloadKey}`;
  const isLoading = result?.key !== requestKey;
  const data = result?.data ?? null;
  const error = isLoading ? null : (result?.error ?? null);

  useEffect(() => {
    let cancelled = false;
    getTagCounts()
      .then((result) => !cancelled && setTags(result))
      .catch(() => !cancelled && setTags([]));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (waitingForAuth) return;
    let cancelled = false;
    getQuestions(questionFilters)
      .then((page) => {
        if (!cancelled) setResult({ key: requestKey, data: page, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setResult((prev) => ({
            key: requestKey,
            data: prev?.data ?? null,
            error: "We couldn't load problems right now. Check your connection and try again.",
          }));
        }
      });
    return () => {
      cancelled = true;
    };
    // requestKey captures questionFilters and reloadKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, waitingForAuth]);

  const solvedIds = useMemo(
    () => (isAuthenticated && libraryStatus === "ready" ? new Set(solvedIdList) : undefined),
    [isAuthenticated, libraryStatus, solvedIdList]
  );

  const total = data?.totalElements;
  const filtered = hasActiveFilters(filters);

  const progressStats = useUserProgressStore((s) => s.stats);
  const loadProgress = useUserProgressStore((s) => s.load);
  useEffect(() => {
    if (isAuthenticated && user?.userId) void loadProgress(String(user.userId));
  }, [isAuthenticated, user?.userId, loadProgress]);

  const progress =
    solvedIds && progressStats ? { solved: solvedIds.size, total: progressStats.totalQuestions } : null;

  const pickRandom = () => {
    const pool = data?.content ?? [];
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(problemPath(pick.questionTitle, pick.id));
  };

  return (
    <LibraryLayout active={{ kind: "all" }} rail={<ProblemsRail />}>
        <h1 className="sr-only">
          Problems{typeof total === "number" && !error ? ` (${total} ${filtered ? "matching" : "total"})` : ""}
        </h1>

        <div className="space-y-4">
          <TopicChips tags={tags} selected={filters.tags} onToggle={toggleTag} />
          <ProblemsToolbar
            filters={filters}
            onChange={setFilters}
            onToggleTag={toggleTag}
            onReset={resetFilters}
            tags={tags}
            showStatus={isAuthenticated}
            progress={progress}
            onRandom={data && data.content.length > 0 ? pickRandom : undefined}
          />
        </div>

        <div className="mt-3">
          {isLoading && (!data || result?.error) ? (
            <ProblemsTableSkeleton />
          ) : error || !data ? (
            <div className="rounded-lg border bg-card">
              <EmptyState
                tone="error"
                title="Couldn't load problems"
                description={error ?? "Something went wrong."}
                action={
                  <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
                    <RotateCcw />
                    Try again
                  </Button>
                }
              />
            </div>
          ) : (
            <div className={isLoading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"} aria-busy={isLoading}>
              <ProblemsTable
                questions={data.content}
                solvedIds={solvedIds}
                activeTags={filters.tags}
                emptyState={
                  <EmptyState
                    icon={<SearchX />}
                    title={filtered ? "No problems match these filters" : "No problems yet"}
                    description={
                      filtered
                        ? filters.tags.length > 1
                          ? "Problems must have every selected topic. Try removing one."
                          : "Try a different search, difficulty or topic."
                        : "Problems will show up here once they are published."
                    }
                    action={
                      filtered ? (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                }
              />
              <ProblemsPagination
                currentPage={data.pageable?.pageNumber ?? filters.page}
                totalPages={data.totalPages}
                pageHref={pageHref}
              />
            </div>
          )}
        </div>
    </LibraryLayout>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[66rem] px-4 py-6 sm:px-6 lg:px-8">
          <ProblemsTableSkeleton />
        </div>
      }
    >
      <ProblemsPageContent />
    </Suspense>
  );
}
