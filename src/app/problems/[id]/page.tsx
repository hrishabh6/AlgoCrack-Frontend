import { getQuestionById, getQuestions, getTestCases } from "@/lib/api/problem-service";
import { getTodayDailyChallenge } from "@/lib/api/daily-challenge-service";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { notFound } from "next/navigation";
import { extractProblemId, slugify } from "@/lib/slug-utils";
import type { TestCase } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";

export const dynamic = "force-dynamic";

/**
 * Search is a substring match on the raw title, and slugs drop punctuation ("k-Group" → "k-group"),
 * so the de-hyphenated slug may not appear in the title. Fall back to single slug words, longest first.
 */
async function findProblemIdBySlug(slug: string): Promise<number | null> {
    const words = slug.split("-").filter((w) => w.length > 1);
    const candidates = [slug.replace(/-/g, " "), ...[...words].sort((a, b) => b.length - a.length).slice(0, 3)];
    for (const search of new Set(candidates)) {
        const matches = await getQuestions({ search, page: 0, size: 100 });
        const matched = matches.content.find((q) => slugify(q.questionTitle) === slug);
        if (matched) return matched.id;
    }
    return null;
}

export default async function ProblemEditorPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const rawParam = decodeURIComponent(params.id);
    let problemId = extractProblemId(rawParam);

    if (problemId === null) {
        try {
            problemId = await findProblemIdBySlug(rawParam);
        } catch {
            return notFound();
        }
    }

    if (problemId === null || Number.isNaN(problemId)) {
        return notFound();
    }

    let problem;
    let testCases: TestCase[] = [];
    let dailyChallengeProblemId: number | null = null;

    try {
        const [p, t, potd] = await Promise.all([
            getQuestionById(problemId),
            getTestCases(problemId).catch(() => []),
            getTodayDailyChallenge({ server: true }),
        ]);
        problem = p;
        testCases = t;
        dailyChallengeProblemId = potd?.problem.id ?? null;
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
        <EditorLayout
            problem={problem}
            testCases={testCases}
            dailyChallengeProblemId={dailyChallengeProblemId}
        />
    );
}
