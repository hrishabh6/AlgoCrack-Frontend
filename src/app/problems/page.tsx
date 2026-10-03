"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { getQuestions, getTags } from "@/lib/api/problem-service";
import { ProblemsTable, ProblemsTableSkeleton } from "@/components/problems/problems-table";
import { ProblemsFilters } from "@/components/problems/problems-filters";
import { ProblemsPagination } from "@/components/problems/problems-pagination";
import { EmptyState, PageContainer, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Difficulty, QuestionFilters, PaginatedResponse, QuestionSummary, Tag } from "@/types";

function ProblemsPageContent() {
  const searchParams = useSearchParams();
  const [questionsData, setQuestionsData] = useState<PaginatedResponse<QuestionSummary> | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const page = Number(searchParams.get("page")) || 0;
      const size = Number(searchParams.get("size")) || 20;
      const rawDifficulty = searchParams.get("difficulty");
      const difficulty =
        rawDifficulty && rawDifficulty !== "all" ? (rawDifficulty as Difficulty) : undefined;
      const tag = searchParams.get("tag") || undefined;
      const search = searchParams.get("search") || undefined;
      const company = searchParams.get("company") || undefined;

      const filters: QuestionFilters = {
        page,
        size,
        difficulty,
        tag: tag === "all" ? undefined : tag,
        search,
        company,
      };

      try {
        const [qData, tData] = await Promise.all([
          getQuestions(filters),
          getTags().catch(() => []),
        ]);
        setQuestionsData(qData);
        setTags(tData);
      } catch (err: unknown) {
        console.error("Failed to fetch problems:", err);
        setError("Failed to load problems. Please ensure you are logged in and the server is running.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchParams, reloadKey]);

  const total = questionsData?.totalElements;

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Problems"
        meta={
          typeof total === "number" && !error ? (
            <span className="font-mono tabular-nums">
              {total} {total === 1 ? "problem" : "problems"}
            </span>
          ) : null
        }
        description="Browse and solve coding problems to prepare for your next interview."
      />

      <div className="mt-6">
        <ProblemsFilters availableTags={tags} />
      </div>

      <div className="mt-3">
        {isLoading ? (
          <ProblemsTableSkeleton />
        ) : error || !questionsData ? (
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
          <>
            <ProblemsTable questions={questionsData.content} />
            <ProblemsPagination
              currentPage={questionsData.pageable.pageNumber}
              totalPages={questionsData.totalPages}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer size="wide">
          <ProblemsTableSkeleton />
        </PageContainer>
      }
    >
      <ProblemsPageContent />
    </Suspense>
  );
}
