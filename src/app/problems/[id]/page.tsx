import { getQuestionById, getQuestions, getTestCases } from "@/lib/api/problem-service";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { notFound } from "next/navigation";
import { extractProblemId, slugify } from "@/lib/slug-utils";
import type { TestCase } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";

export const dynamic = "force-dynamic";

export default async function ProblemEditorPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const rawParam = decodeURIComponent(params.id);
    let problemId = extractProblemId(rawParam);

    if (problemId === null) {
        try {
            const query = rawParam.replace(/-/g, " ");
            const matches = await getQuestions({ search: query, page: 0, size: 100 });
            const matched = matches.content.find((q) => slugify(q.questionTitle) === rawParam);
            if (matched) {
                problemId = matched.id;
            }
        } catch {
            return notFound();
        }
    }

    if (problemId === null || Number.isNaN(problemId)) {
        return notFound();
    }

    let problem;
    let testCases: TestCase[] = [];

    try {
        const [p, t] = await Promise.all([
            getQuestionById(problemId),
            getTestCases(problemId).catch(() => []),
        ]);
        problem = p;
        testCases = t;
    } catch (error) {
        console.error(`Failed to fetch problem ${problemId}:`, error);
        return (
            <div className="flex min-h-[calc(100dvh-3rem)] items-center justify-center p-6">
                <EmptyState
                    tone="error"
                    title="Failed to load problem"
                    description="Could not fetch problem details. Please try again later."
                    action={
                        <Button asChild variant="outline" size="sm">
                            <Link href="/problems">Back to problems</Link>
                        </Button>
                    }
                />
            </div>
        );
    }
    return (
        <EditorLayout problem={problem} testCases={testCases} />
    );
}
