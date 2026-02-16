"use client";

console.log('>>> problem-actions.tsx LOADED <<<');

import { Button } from "@/components/ui/button";
import { Play, Send, Loader2 } from "lucide-react";
import { useSubmissionStore, useEditorStore } from "@/store";
import { runCode, submitSolution, pollSubmission } from "@/lib/api/submission-service";

export function ProblemActions() {
    console.log('>>> ProblemActions component rendered <<<');
    const { isRunning, isSubmitting, startRun, startSubmission, setResults, setError } = useSubmissionStore();
    const { language, code, currentProblem, getTestcasesForRun, setActiveTab } = useEditorStore();

    const handleRun = async () => {
        if (!currentProblem) return;

        try {
            startRun(currentProblem.id.toString());


            // Get testcases from unified store (handles default + user-modified)
            const testCases = getTestcasesForRun();

            console.log('=== handleRun Debug ===');
            console.log('testCases for run:', JSON.stringify(testCases, null, 2));

            const payload = {
                questionId: currentProblem.id,
                language,
                code,
                customTestCases: testCases,
            };

            // Use new synchronous /run endpoint
            const response = await runCode(payload);

            console.log('=== Response received in handleRun ===');
            console.log('Full response object:', response);
            console.log('response.verdict:', response.verdict);
            console.log('response.testCaseResults:', response.testCaseResults);
            console.log('response.compilationOutput:', response.compilationOutput);
            console.log('response.errorMessage:', response.errorMessage);

            // Map RunResponse to store format
            const storePayload = {
                verdict: response.verdict,
                runtimeMs: response.runtimeMs,
                memoryKb: response.memoryKb,
                compilationOutput: response.compilationOutput ?? undefined,
                errorMessage: response.errorMessage ?? undefined,
                testCaseResults: response.testCaseResults ?? undefined,
            };

            console.log('=== Setting to store ===');
            console.log('storePayload:', JSON.stringify(storePayload, null, 2));

            setResults(storePayload);

            setActiveTab("results");

        } catch (err) {
            console.error('Run error:', err);
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleSubmit = async () => {
        console.log('====== SUBMIT BUTTON CLICKED ======');
        if (!currentProblem) {
            console.log('No currentProblem - returning early');
            return;
        }

        try {
            const tempSubmissionId = `${currentProblem.id}-${Date.now()}`;
            console.log('Starting submission with tempId:', tempSubmissionId);
            startSubmission(tempSubmissionId);

            const payload = {
                userId: 1, // TODO: Get from auth context
                questionId: currentProblem.id,
                language,
                code,
            };

            console.log('Submit payload:', JSON.stringify(payload, null, 2));
            const response = await submitSolution(payload);
            console.log('submitSolution response:', response);

            const submissionId = response.submissionId;
            console.log('submissionId:', submissionId);

            if (submissionId) {
                console.log('Polling for submission result...');
                // Poll for completion
                const result = await pollSubmission(submissionId);
                console.log('=== Poll Result (Raw) ===');
                console.log(JSON.stringify(result, null, 2));
                console.log('result.verdict:', result.verdict);
                console.log('result.testCaseResults:', result.testCaseResults);
                console.log('result.compilationOutput:', result.compilationOutput);
                console.log('result.errorMessage:', result.errorMessage);

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

                console.log('Setting to store:', JSON.stringify(storePayload, null, 2));
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
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRun}
                disabled={isRunning || isSubmitting || !currentProblem}
            >
                {isRunning ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                    </>
                ) : (
                    <>
                        <Play className="h-4 w-4 mr-2" />
                        Run
                    </>
                )}
            </Button>
            <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || !currentProblem}
                className="bg-green-600 hover:bg-green-700"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                    </>
                )}
            </Button>
        </div>
    );
}
