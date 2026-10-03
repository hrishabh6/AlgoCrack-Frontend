"use client";

import { Button } from "@/components/ui/button";
import { Play, Send, Loader2 } from "lucide-react";
import { useSubmissionStore, useEditorStore } from "@/store";
import { runCode, submitSolution, pollSubmission } from "@/lib/api/submission-service";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ProblemActions() {
    const { isRunning, isSubmitting, startRun, startSubmission, setResults, setError } = useSubmissionStore();
    const { language, code, currentProblem, getTestcasesForRun, setActiveTab } = useEditorStore();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    if (!isAuthenticated) {
        return null;
    }

    const handleRun = async () => {
        if (!isAuthenticated) {
            router.push("/auth/signin");
            return;
        }
        if (!currentProblem) return;

        try {
            startRun(currentProblem.id.toString());


            // Get testcases from unified store (handles default + user-modified)
            const testCases = getTestcasesForRun();

            const payload = {
                questionId: currentProblem.id,
                language,
                code,
                customTestCases: testCases,
            };

            // Use new synchronous /run endpoint
            const response = await runCode(payload);

            // Map RunResponse to store format
            const storePayload = {
                verdict: response.verdict,
                runtimeMs: response.runtimeMs,
                memoryKb: response.memoryKb,
                compilationOutput: response.compilationOutput ?? undefined,
                errorMessage: response.errorMessage ?? undefined,
                testCaseResults: response.testCaseResults ?? undefined,
            };

            setResults(storePayload);

            setActiveTab("results");

        } catch (err) {
            console.error('Run error:', err);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            router.push("/auth/signin");
            return;
        }

        if (!currentProblem) {
            return;
        }

        try {
            const tempSubmissionId = `${currentProblem.id}-${Date.now()}`;
            startSubmission(tempSubmissionId);

            const payload = {
                userId: user?.userId || "",
                questionId: currentProblem.id,
                language,
                code,
            };

            const response = await submitSolution(payload);

            const submissionId = response.submissionId;

            if (submissionId) {
                // Poll for completion
                const result = await pollSubmission(submissionId);

                const storePayload = {
                    verdict: result.verdict ?? "WRONG_ANSWER",
                    runtimeMs: result.runtimeMs ?? undefined,
                    memoryKb: result.memoryKb ?? undefined,
                    passedTestCases: result.passedTestCases ?? undefined,
                    totalTestCases: result.totalTestCases ?? undefined,
                    errorMessage: result.errorMessage ?? undefined,
                    compilationOutput: result.compilationOutput ?? undefined,
                    testCaseResults: result.testCaseResults ?? undefined,
                };

                setResults(storePayload);

                setActiveTab("results");
            } else {
                throw new Error("No submission ID returned from submission service");
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <div className="flex items-center gap-1.5">
            <Button
                variant="secondary"
                size="sm"
                className="h-7 md:h-8"
                onClick={handleRun}
                disabled={isRunning || isSubmitting || !currentProblem}
                title="Run against the test cases below"
            >
                {isRunning ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Running…
                    </>
                ) : (
                    <>
                        <Play />
                        Run
                    </>
                )}
            </Button>
            <Button
                variant="default"
                size="sm"
                className="h-7 md:h-8"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || !currentProblem}
                title="Submit for judging against hidden tests"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Submitting…
                    </>
                ) : (
                    <>
                        <Send />
                        Submit
                    </>
                )}
            </Button>
        </div>
    );
}
