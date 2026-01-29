"use client";

import { useSubmissionSocket } from "@/lib/hooks/useSubmissionSocket";

import { Button } from "@/components/ui/button";
import { Play, Send, Loader2 } from "lucide-react";
import { useSubmissionStore } from "@/store";
import { useEditorStore } from "@/store";
import { runCode, pollExecution } from "@/lib/api/code-execution-service";
import { submitSolution } from "@/lib/api/submission-service";

export function ProblemActions() {
    const { isRunning, isSubmitting, startRun, startSubmission, setResults, setError } = useSubmissionStore();
    const { language, code, currentProblem, currentTestCases, setActiveTab } = useEditorStore();
    // Initialize WebSocket listener for real‑time updates
    // useSubmissionSocket();

    const handleRun = async () => {
        if (!currentProblem) return;
        try {
            startRun(currentProblem.id.toString());
            const payload = {
                language,
                source: code,
                testCases: currentTestCases,
            };
            const submission = await runCode(payload); // submission: { submissionId, status, ... }
            if (submission.submissionId) {
                const result = await pollExecution(submission.submissionId);
                setResults({
                    verdict: result.verdict || result.status,
                    runtimeMs: result.runtimeMs,
                    memoryKb: result.memoryKb,
                    passedTestCases: result.passedTestCases,
                    totalTestCases: result.totalTestCases,
                    errorMessage: result.errorMessage,
                    compilationOutput: result.compilationOutput,
                    testCaseResults: result.testCaseResults,
                });
            } else {
                throw new Error("No submission ID returned from CXE");
            }

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleSubmit = async () => {
        if (!currentProblem) return;
        try {
            const tempSubmissionId = `${currentProblem.id}-${Date.now()}`; // simple id
            startSubmission(tempSubmissionId);
            const payload = {
                userId: 1, // Hardcoded for now as per user instruction
                questionId: currentProblem.id,
                language,
                code,
            };
            const response = await submitSolution(payload);

            // The submission service should return the submission ID (or we expect it to)
            // Based on user feedback, we can poll the execution service with the returned ID.
            // If response has submissionId, use it. 
            const submissionId = response.submissionId || response.id; // Adjust based on actual response shape if known, but user didn't specify. Assuming typical naming.

            if (submissionId) {
                const result = await pollExecution(submissionId);
                setResults({
                    verdict: result.verdict || result.status,
                    runtimeMs: result.runtimeMs,
                    memoryKb: result.memoryKb,
                    passedTestCases: result.passedTestCases,
                    totalTestCases: result.totalTestCases,
                    errorMessage: result.errorMessage,
                    compilationOutput: result.compilationOutput,
                    testCaseResults: result.testCaseResults,
                });
                setActiveTab("results");
            } else {
                // Fallback if no ID returned - though this shouldn't happen if API is correct
                throw new Error("No submission ID returned from submission service");
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="secondary"
                size="sm"
                className="h-8 min-w-[80px]"
                disabled={isRunning || isSubmitting}
                onClick={handleRun}
            >
                {isRunning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Play className="mr-2 h-4 w-4" />
                )}
                Run
            </Button>
            <Button
                size="sm"
                className="h-8 min-w-[80px]"
                disabled={isRunning || isSubmitting}
                onClick={handleSubmit}
            >
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Submit
            </Button>
        </div>
    );
}
