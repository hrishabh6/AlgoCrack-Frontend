"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getQuestions, getTags } from "@/lib/api/problem-service";
import { ProblemsTable } from "@/components/problems/problems-table";
import { ProblemsFilters } from "@/components/problems/problems-filters";
import { ProblemsPagination } from "@/components/problems/problems-pagination";
import { QuestionFilters, PaginatedResponse, QuestionSummary, Tag } from "@/types";
import { Loader2 } from "lucide-react";

function ProblemsPageContent() {
  const searchParams = useSearchParams();
  const [questionsData, setQuestionsData] = useState<PaginatedResponse<QuestionSummary> | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const page = Number(searchParams.get("page")) || 0;
      const size = Number(searchParams.get("size")) || 20;
      const difficulty = searchParams.get("difficulty") as "Easy" | "Medium" | "Hard" | undefined;
      const tag = searchParams.get("tag") || undefined;
      const search = searchParams.get("search") || undefined;
      const company = searchParams.get("company") || undefined;

      const filters: QuestionFilters = {
        page,
        size,
        difficulty: difficulty === ("all" as any) ? undefined : difficulty,
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
      } catch (err: any) {
        console.error("Failed to fetch problems:", err);
        setError("Failed to load problems. Please ensure you are logged in and the server is running.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !questionsData) {
    return (
      <div className="w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Problems</h1>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive">Error</h3>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Problems</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and solve coding problems to prepare for your next interview.
        </p>
      </div>

      <ProblemsFilters availableTags={tags} />

      <div className="mt-6">
        <ProblemsTable questions={questionsData.content} />
      </div>

      <ProblemsPagination
        currentPage={questionsData.pageable.pageNumber}
        totalPages={questionsData.totalPages}
      />
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <ProblemsPageContent />
    </Suspense>
  );
}
