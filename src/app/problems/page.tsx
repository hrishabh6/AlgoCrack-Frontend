import { getQuestions, getTags } from "@/lib/api/problem-service";
import { ProblemsTable } from "@/components/problems/problems-table";
import { ProblemsFilters } from "@/components/problems/problems-filters";
import { ProblemsPagination } from "@/components/problems/problems-pagination";
import { QuestionFilters } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProblemsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = Number(searchParams.page) || 0;
  const size = Number(searchParams.size) || 20;
  const difficulty = searchParams.difficulty as "Easy" | "Medium" | "Hard" | undefined;
  const tag = searchParams.tag as string | undefined;
  const search = searchParams.search as string | undefined;

  const filters: QuestionFilters = {
    page,
    size,
    difficulty,
    tag,
    search,
  };

  // Handle "all" cases
  if (difficulty === ("all" as any)) delete filters.difficulty;
  if (tag === "all") delete filters.tag;

  // Parallel fetch
  /* 
   * We use a try-catch block here to handle API failures gracefully.
   * If the API is down, we render an error message instead of crashing the page.
   */
  let questionsData;
  let tags = [];

  try {
    const [qData, tData] = await Promise.all([
      getQuestions(filters),
      getTags().catch(() => []), // Fail gracefully for tags
    ]);
    questionsData = qData;
    tags = tData;
  } catch (error) {
    console.error("Failed to fetch problems:", error);
    return (
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold">Problems</h1>
        <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive">Failed to load problems</h3>
          <p className="mt-2 text-muted-foreground">
            There was an error connecting to the backend services. Please make sure the backend is running.
          </p>
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
