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
import { EmptyState, PageContainer, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";
import type { PaginatedResponse, QuestionSummary, TagCount } from "@/types";

interface QueryResult {
  key: string;
  data: PaginatedResponse<QuestionSummary> | null;
  error: string | null;
}

function ProblemsPageContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  return (
    <PageContainer>
      <LibraryLayout active={{ kind: "all" }}>
        <PageHeader
          title="Problems"
          meta={
            typeof total === "number" && !error ? (
              <span className="flex items-center gap-3 font-mono tabular-nums">
                <span>
                  {total} {filtered ? "matching" : total === 1 ? "problem" : "problems"}
                </span>
                {solvedIds && (
                  <span className="text-success">
                    {solvedIds.size} solved
                  </span>
                )}
              </span>
            ) : null
          }
          description="Pick a topic, narrow it down, and keep the ones worth revisiting in your own lists."
        />

        <div className="mt-5 space-y-3">
          <TopicChips
            tags={tags}
            selected={filters.tags}
            onToggle={toggleTag}
            onClear={() => setFilters({ tags: [] })}
          />
          <ProblemsToolbar
            filters={filters}
            onChange={setFilters}
            onToggleTag={toggleTag}
            onReset={resetFilters}
            tags={tags}
            showStatus={isAuthenticated}
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
    </PageContainer>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <ProblemsTableSkeleton />
        </PageContainer>
      }
    >
      <ProblemsPageContent />
    </Suspense>
  );
}
