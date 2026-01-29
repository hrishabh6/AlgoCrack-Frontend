"use client";

import { useSubmissionStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle, Clock, Database, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function SubmissionResult() {
    const {
        verdict,
        runtimeMs,
        memoryKb,
        errorMessage,
        testCaseResults,
        submissionStatus
    } = useSubmissionStore();

    if (!verdict && !submissionStatus) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Run code to see results.</p>
            </div>
        );
    }

    const isSuccess = verdict === "ACCEPTED";
    const isError = verdict === "RUNTIME_ERROR" || verdict === "COMPILATION_ERROR" || verdict === "WRONG_ANSWER" || verdict === "TIME_LIMIT_EXCEEDED";

    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
                {/* Status Header */}
                <div className={cn(
                    "rounded-lg border p-4",
                    isSuccess ? "bg-green-500/10 border-green-500/20" : isError ? "bg-red-500/10 border-red-500/20" : "bg-muted"
                )}>
                    <div className="flex items-center gap-2 mb-2">
                         {isSuccess ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                         ) : isError ? (
                            <XCircle className="h-6 w-6 text-red-500" />
                         ) : (
                            <Terminal className="h-6 w-6 text-muted-foreground" />
                         )}
                         <h2 className={cn(
                             "text-xl font-bold",
                             isSuccess ? "text-green-500" : isError ? "text-red-500" : "text-foreground"
                         )}>
                            {verdict || submissionStatus || "Processing..."}
                         </h2>
                    </div>
                    {errorMessage && (
                         <div className="mt-2 text-sm font-mono whitespace-pre-wrap text-destructive">
                            {errorMessage}
                         </div>
                    )}
                </div>

                {/* Stats Grid */}
                {(runtimeMs !== null || memoryKb !== null) && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">Runtime</span>
                            </div>
                            <div className="text-2xl font-bold">
                                {runtimeMs} <span className="text-sm font-normal text-muted-foreground">ms</span>
                            </div>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Database className="h-4 w-4" />
                                <span className="text-sm font-medium">Memory</span>
                            </div>
                            <div className="text-2xl font-bold">
                                {(memoryKb ? memoryKb / 1024 : 0).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">MB</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Cases Breakdown (if available and relevant) */}
                {testCaseResults && testCaseResults.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Test Cases</h3>
                        <div className="grid grid-cols-1 gap-2">
                             {testCaseResults.map((tc, idx) => (
                                 <div key={idx} className={cn(
                                     "flex items-center justify-between p-3 rounded-md border",
                                     tc.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                                 )}>
                                     <div className="flex items-center gap-3">
                                         <Badge variant={tc.passed ? "secondary" : "destructive"}>
                                             Case {idx + 1}
                                         </Badge>
                                         <span className="text-sm text-muted-foreground">
                                             {tc.executionTimeMs}ms
                                         </span>
                                     </div>
                                     <div className="text-sm font-medium">
                                          {tc.passed ? (
                                              <span className="text-green-500 flex items-center gap-1">
                                                  <CheckCircle2 className="h-4 w-4" /> Passed
                                              </span>
                                          ) : (
                                              <span className="text-red-500 flex items-center gap-1">
                                                  <XCircle className="h-4 w-4" /> Failed
                                              </span>
                                          )}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
