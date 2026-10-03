"use client";

import { useSubmissionStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Activity, Clock, Database, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVerdictMeta, formatMemoryKb } from "@/lib/verdict";
import { EmptyState, StatCard, TONE_TEXT } from "@/components/shared";

export function SubmissionResult() {
    const {
        verdict,
        runtimeMs,
        memoryKb,
        errorMessage,
        testCaseResults,
        submissionStatus,
        passedTestCases,
        totalTestCases,
        isRunning,
        isSubmitting,
    } = useSubmissionStore();

    if (!verdict && !submissionStatus) {
        return (
            <EmptyState
                icon={<Activity />}
                title="No results yet"
                description="Run or submit your code to see the verdict here."
                className="h-full"
            />
        );
    }

    const meta = getVerdictMeta(verdict, submissionStatus);
    const pending = !verdict && (isRunning || isSubmitting);
    const Icon = pending
        ? Loader2
        : meta.tone === "success"
          ? CheckCircle2
          : meta.tone === "warning"
            ? AlertTriangle
            : meta.tone === "danger"
              ? XCircle
              : Activity;
    const label = pending ? (isSubmitting ? "Judging…" : "Running…") : meta.label;
    const hasCounts = typeof passedTestCases === "number" && typeof totalTestCases === "number";

    return (
        <ScrollArea className="h-full">
            <div className="space-y-4 p-5">
                {/* Status Header */}
                <div
                    className={cn(
                        "rounded-lg border p-4",
                        meta.tone === "success" && "border-success/25 bg-success/8",
                        meta.tone === "danger" && "border-destructive/25 bg-destructive/8",
                        meta.tone === "warning" && "border-warning/25 bg-warning/8",
                        (meta.tone === "info" || meta.tone === "muted") && "bg-muted/50"
                    )}
                    role="status"
                >
                    <div className="flex items-center gap-2">
                        <Icon className={cn("size-5", TONE_TEXT[meta.tone], pending && "animate-spin")} aria-hidden="true" />
                        <h2 className={cn("text-lg font-semibold tracking-tight", TONE_TEXT[meta.tone])}>
                            {label}
                        </h2>
                        {hasCounts && (
                            <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">
                                {passedTestCases}/{totalTestCases} passed
                            </span>
                        )}
                    </div>
                    {errorMessage && (
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md border border-destructive/20 bg-background/60 p-2.5 font-mono text-xs text-destructive">
                            {errorMessage}
                        </pre>
                    )}
                </div>

                {/* Stats Grid */}
                {(runtimeMs !== null || memoryKb !== null) && (
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            label="Runtime"
                            icon={<Clock />}
                            value={
                                <>
                                    {runtimeMs ?? "—"}
                                    <span className="ml-1 text-sm font-normal text-muted-foreground">ms</span>
                                </>
                            }
                        />
                        <StatCard
                            label="Memory"
                            icon={<Database />}
                            value={
                                <>
                                    {(memoryKb ? memoryKb / 1024 : 0).toFixed(2)}
                                    <span className="ml-1 text-sm font-normal text-muted-foreground">MB</span>
                                </>
                            }
                            helper={formatMemoryKb(memoryKb) ? undefined : "Not reported"}
                        />
                    </div>
                )}

                {/* Test Cases Breakdown */}
                {testCaseResults && testCaseResults.length > 0 && (
                    <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test cases</h3>
                        <ul className="divide-y overflow-hidden rounded-lg border bg-card">
                            {testCaseResults.map((tc, idx) => (
                                <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">Case {idx + 1}</span>
                                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                            {tc.executionTimeMs} ms
                                        </span>
                                    </div>
                                    {tc.passed ? (
                                        <span className="flex items-center gap-1 text-xs font-medium text-success">
                                            <CheckCircle2 className="size-3.5" aria-hidden="true" /> Passed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                                            <XCircle className="size-3.5" aria-hidden="true" /> Failed
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </ScrollArea>
    );
}
