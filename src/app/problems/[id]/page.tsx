import { getQuestionById, getTestCases } from "@/lib/api/problem-service";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProblemEditorPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const problemId = parseInt(params.id);

    if (isNaN(problemId)) {
        return notFound();
    }

    let problem;
    let testCases = [];

    try {
        const [p, t] = await Promise.all([
            getQuestionById(problemId),
            getTestCases(problemId).catch(() => []),
        ]);
        problem = p;
        testCases = t as any; // Type assertion to handle potential mismatch or inferred type issues
    } catch (error) {
        console.error(`Failed to fetch problem ${problemId}:`, error);
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Failed to load problem</h1>
                <p className="text-muted-foreground">
                    Could not fetch problem details. Please try again later.
                </p>
            </div>
        );
    }
    return (
        <EditorLayout problem={problem} testCases={testCases} />
    );
}
