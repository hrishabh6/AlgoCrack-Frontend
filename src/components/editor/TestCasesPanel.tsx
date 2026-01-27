import { useEditorStore, useSubmissionStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestCasesPanel() {
    const {
        currentTestCases,
        customTestCases,
        activeTestCaseIndex,
        setActiveTestCaseIndex,
        addCustomTestCase,
        removeCustomTestCase
    } = useEditorStore();

    const {
        testCaseResults,
        isRunning,
        verdict,
        compilationOutput,
        errorMessage
    } = useSubmissionStore();

    // Combine standard and custom test cases for display
    // For now, we'll focus on just the standard cases or custom ones if we implement "Run Custom"
    // Let's assume we just show the standard ones first
    const testCases = currentTestCases;
    const activeTestCase = testCases[activeTestCaseIndex];
    const activeResult = testCaseResults?.find(r => r.index === activeTestCaseIndex);

    if (!testCases || testCases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <p>No test cases available.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b px-2 min-h-[40px]">
                <div className="flex items-center overflow-x-auto no-scrollbar">
                    {testCases.map((tc, index) => {
                        const result = testCaseResults?.find(r => r.index === index);
                        let statusColor = "";
                        let StatusIcon = null;

                        if (result) {
                            if (result.passed) {
                                statusColor = "text-green-500";
                                StatusIcon = CheckCircle2;
                            } else {
                                statusColor = "text-red-500";
                                StatusIcon = XCircle;
                            }
                        }

                        return (
                            <button
                                key={tc.id}
                                onClick={() => setActiveTestCaseIndex(index)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                                    activeTestCaseIndex === index
                                        ? "border-b-2 border-primary text-foreground"
                                        : "text-muted-foreground border-b-2 border-transparent"
                                )}
                            >
                                {StatusIcon && <StatusIcon className={cn("h-3.5 w-3.5", statusColor)} />}
                                Case {index + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {/* Compilation/Runtime Error Display */}
                    {(errorMessage || compilationOutput) && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mb-4">
                            <div className="flex items-center gap-2 font-semibold mb-1">
                                <AlertCircle className="h-4 w-4" />
                                {verdict || "Error"}
                            </div>
                            <pre className="whitespace-pre-wrap font-mono text-xs">
                                {errorMessage || compilationOutput}
                            </pre>
                        </div>
                    )}

                    {activeTestCase && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Input</label>
                                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                                    {activeTestCase.input}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Expected Output</label>
                                <div className="rounded-md bg-muted p-3 font-mono text-sm">
                                    {activeTestCase.expectedOutput}
                                </div>
                            </div>

                            {activeResult && (
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Actual Output</label>
                                    <div className={cn(
                                        "rounded-md p-3 font-mono text-sm border",
                                        activeResult.passed
                                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                                            : "bg-red-500/10 border-red-500/20 text-red-500"
                                    )}>
                                        {activeResult.actualOutput}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
