"use client";

import { useEditorStore, useSubmissionStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, RotateCcw, Trash2, FlaskConical, Terminal, Loader2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getVerdictMeta } from "@/lib/verdict";
import { TONE_TEXT } from "@/components/shared";
import { workspaceTabTrigger } from "./workspace-styles";

type PanelTab = "cases" | "result";

const caseButton =
    "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-medium transition-colors duration-150";

export function TestCasesPanel() {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const loginUrl = `/auth/signin?next=${encodeURIComponent(currentPath)}`;
    const signupUrl = `/auth/signup?next=${encodeURIComponent(currentPath)}`;
    const {
        testcases,
        activeTestCaseIndex,
        setActiveTestCaseIndex,
        updateTestcaseInput,
        addTestcase,
        removeTestcase,
        resetTestcase,
    } = useEditorStore();

    const {
        testCaseResults,
        verdict,
        runtimeMs,
        compilationOutput,
        errorMessage,
        isRunning,
        isSubmitting,
    } = useSubmissionStore();

    const [newTestcaseInput, setNewTestcaseInput] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Switch to the result tab whenever a verdict arrives, back to cases when it clears.
    const [activeTab, setActiveTab] = useState<PanelTab>(verdict ? "result" : "cases");
    const [prevVerdict, setPrevVerdict] = useState(verdict);
    if (verdict !== prevVerdict) {
        setPrevVerdict(verdict);
        setActiveTab(verdict ? "result" : "cases");
    }

    const activeTestcase = testcases[activeTestCaseIndex];
    const activeResult = testCaseResults?.find(r => r.index === activeTestCaseIndex);
    const verdictMeta = verdict ? getVerdictMeta(verdict) : null;
    const isBusy = isRunning || isSubmitting;

    const handleAddTestcase = () => {
        if (newTestcaseInput.trim()) {
            addTestcase(newTestcaseInput.trim());
            setNewTestcaseInput("");
            setIsAddingNew(false);
        }
    };

    const addForm = isAddingNew && (
        <div className="mb-3 rounded-md border border-dashed border-border-strong bg-muted/40 p-3">
            <label htmlFor="new-testcase" className="mb-2 block text-xs font-medium text-muted-foreground">
                New test case input
            </label>
            <textarea
                id="new-testcase"
                value={newTestcaseInput}
                onChange={(e) => setNewTestcaseInput(e.target.value)}
                className="min-h-[64px] w-full resize-y rounded-md border border-input bg-surface p-2 font-mono text-xs outline-none transition-colors focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring/25"
                placeholder='{"nums": [1,2,3], "target": 5}'
                spellCheck={false}
                autoFocus
            />
            <div className="mt-2 flex gap-2">
                <Button size="xs" onClick={handleAddTestcase} disabled={!newTestcaseInput.trim()}>
                    Add case
                </Button>
                <Button size="xs" variant="ghost" onClick={() => setIsAddingNew(false)}>
                    Cancel
                </Button>
            </div>
        </div>
    );

    if (!testcases || testcases.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 text-sm text-muted-foreground">
                <div className="w-full max-w-md">
                    {addForm}
                </div>
                {!isAddingNew && (
                    <>
                        <p>No test cases available.</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setIsAddingNew(true)}
                        >
                            <Plus /> Add test case
                        </Button>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Main Tabs (Testcase vs Result) */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-b bg-surface-2 pl-1 pr-2">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PanelTab)} className="gap-0">
                    <TabsList className="h-10 justify-start gap-0 rounded-none bg-transparent p-0">
                        <TabsTrigger value="cases" className={workspaceTabTrigger}>
                            <FlaskConical />
                            Testcase
                        </TabsTrigger>
                        <TabsTrigger value="result" className={workspaceTabTrigger} disabled={!verdict}>
                            <Terminal />
                            Test Result
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    {isBusy && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-info" role="status">
                            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                            {isSubmitting ? "Judging…" : "Running…"}
                        </span>
                    )}
                    {activeTab === "cases" && (
                        <Button variant="ghost" size="xs" onClick={() => setIsAddingNew(true)}>
                            <Plus /> Add case
                        </Button>
                    )}
                </div>
            </div>

            {!isAuthenticated && (
                <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground">
                    <LogIn className="size-3.5 text-primary" aria-hidden="true" />
                    <span>
                        <Link href={loginUrl} className="font-medium text-primary hover:underline">Log in</Link>
                        {" "}or{" "}
                        <Link href={signupUrl} className="font-medium text-primary hover:underline">sign up</Link>
                        {" "}to run or submit
                    </span>
                </div>
            )}

            {/* Content Area */}
            <ScrollArea className="min-h-0 flex-1">
                <div className="p-3">
                    {activeTab === "cases" ? (
                        /* Testcase Input View */
                        <div>
                            {/* Case selector tabs */}
                            <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Test cases">
                                {testcases.map((tc, index) => (
                                    <button
                                        key={index}
                                        role="tab"
                                        aria-selected={activeTestCaseIndex === index}
                                        onClick={() => setActiveTestCaseIndex(index)}
                                        className={cn(
                                            caseButton,
                                            activeTestCaseIndex === index
                                                ? "border-border-strong bg-accent text-foreground"
                                                : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                        )}
                                    >
                                        <span>Case {index + 1}</span>
                                        {tc.isModified && !tc.isUserAdded && (
                                            <span className="size-1.5 rounded-full bg-primary" title="Modified" aria-label="modified" />
                                        )}
                                        {tc.isUserAdded && (
                                            <span className="rounded bg-selected/15 px-1 text-[10px] font-medium text-selected">custom</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Add New Case Form */}
                            {addForm}

                            {/* Active Case Editor */}
                            {activeTestcase && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="testcase-input" className="text-xs font-medium text-muted-foreground">Input</label>
                                        <div className="flex gap-1">
                                            {activeTestcase.isModified && !activeTestcase.isUserAdded && (
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => resetTestcase(activeTestCaseIndex)}
                                                >
                                                    <RotateCcw /> Reset
                                                </Button>
                                            )}
                                            {activeTestcase.isUserAdded && (
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => removeTestcase(activeTestCaseIndex)}
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 /> Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <textarea
                                        id="testcase-input"
                                        value={activeTestcase.input}
                                        onChange={(e) => updateTestcaseInput(activeTestCaseIndex, e.target.value)}
                                        className={cn(
                                            "min-h-[96px] w-full resize-none rounded-md border border-input bg-muted/50 p-3 font-mono text-[13px] leading-relaxed outline-none transition-colors focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring/25",
                                            activeTestcase.isModified && "border-primary/40"
                                        )}
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Test Result View */
                        <div className="space-y-4">
                            {/* Verdict Summary */}
                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                {verdictMeta && (
                                    <h3 className={cn("text-base font-semibold", TONE_TEXT[verdictMeta.tone])}>
                                        {verdictMeta.label}
                                    </h3>
                                )}
                                {runtimeMs !== null && runtimeMs !== undefined && (
                                    <span className="font-mono text-xs text-muted-foreground">
                                        Runtime <span className="text-foreground">{runtimeMs} ms</span>
                                    </span>
                                )}
                            </div>

                            {/* Compilation Error or Runtime Error (Global) */}
                            {errorMessage && !activeResult && (
                                <OutputBlock label="Error" tone="danger">{errorMessage}</OutputBlock>
                            )}

                            {compilationOutput && (
                                <OutputBlock label="Compilation output" tone="warning">{compilationOutput}</OutputBlock>
                            )}

                            {/* Result details per case */}
                            {verdict !== "COMPILATION_ERROR" && verdict !== "INTERNAL_ERROR_RUN" && (
                                <div className="space-y-3">
                                    {/* Case Tabs for Result */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Test case results">
                                        {testCaseResults?.map((res, index) => (
                                            <button
                                                key={index}
                                                role="tab"
                                                aria-selected={activeTestCaseIndex === index}
                                                onClick={() => setActiveTestCaseIndex(index)}
                                                className={cn(
                                                    caseButton,
                                                    activeTestCaseIndex === index
                                                        ? "border-border-strong bg-accent text-foreground"
                                                        : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                                )}
                                            >
                                                {res.passed === true && <span className="size-1.5 rounded-full bg-success" aria-label="passed" />}
                                                {res.passed === false && <span className="size-1.5 rounded-full bg-destructive" aria-label="failed" />}
                                                {res.passed === null && !res.error && <span className="size-1.5 rounded-full bg-info" aria-label="not judged" />}
                                                <span>Case {index + 1}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active Result Detail */}
                                    {activeResult ? (
                                        <div className="space-y-3 animate-in fade-in duration-150">
                                            <OutputBlock label="Input">{testcases[activeTestCaseIndex]?.input}</OutputBlock>
                                            <OutputBlock
                                                label="Output"
                                                tone={activeResult.passed === false ? "danger" : undefined}
                                            >
                                                {activeResult.actualOutput || <span className="italic text-subtle-foreground">(empty)</span>}
                                            </OutputBlock>
                                            {activeResult.expectedOutput && (
                                                <OutputBlock label="Expected">{activeResult.expectedOutput}</OutputBlock>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-xs text-muted-foreground">
                                            Select a case to view details
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function OutputBlock({
    label,
    tone,
    children,
}: {
    label: string;
    tone?: "danger" | "warning";
    children: React.ReactNode;
}) {
    return (
        <div>
            <p
                className={cn(
                    "mb-1 text-xs font-medium",
                    tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : "text-muted-foreground"
                )}
            >
                {label}
            </p>
            <pre
                className={cn(
                    "overflow-x-auto whitespace-pre-wrap break-all rounded-md border p-2.5 font-mono text-[13px] leading-relaxed",
                    tone === "danger"
                        ? "border-destructive/25 bg-destructive/5 text-foreground"
                        : tone === "warning"
                          ? "border-warning/25 bg-warning/5 text-foreground"
                          : "bg-muted/50 text-foreground"
                )}
            >
                {children}
            </pre>
        </div>
    );
}
