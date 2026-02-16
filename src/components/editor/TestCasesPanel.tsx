"use client";

import { useEditorStore, useSubmissionStore } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Plus, RotateCcw, Trash2, List, PlaySquare, Code2, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VERDICT_DISPLAY } from "@/types";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

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
        currentProblem,
    } = useEditorStore();

    const {
        testCaseResults,
        verdict,
        runtimeMs,
        compilationOutput,
        errorMessage
    } = useSubmissionStore();

    const [newTestcaseInput, setNewTestcaseInput] = useState("");
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Tab state: "cases" (Input) or "result" (Output)
    // Automatically switch to result tab when verdict changes (run completes)
    const [activeTab, setActiveTab] = useState<"cases" | "result">("cases");

    useEffect(() => {
        if (verdict) {
            setActiveTab("result");
        }
    }, [verdict]);

    const activeTestcase = testcases[activeTestCaseIndex];
    const activeResult = testCaseResults?.find(r => r.index === activeTestCaseIndex);
    const verdictInfo = verdict ? VERDICT_DISPLAY[verdict] : null;

    const handleAddTestcase = () => {
        if (newTestcaseInput.trim()) {
            addTestcase(newTestcaseInput.trim());
            setNewTestcaseInput("");
            setIsAddingNew(false);
        }
    };

    if (!testcases || testcases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <p>No test cases available.</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsAddingNew(true)}
                >
                    <Plus className="h-4 w-4 mr-1" /> Add Test Case
                </Button>
            </div>
        );
    }



    return (
        <div className="flex flex-col h-full bg-background border-t relative">
            {!isAuthenticated && (
                <div className="absolute inset-x-0 top-[-40px] z-10 flex items-center justify-center h-10 bg-muted/50 backdrop-blur-sm border-b">
                </div>
            )}
            {!isAuthenticated && (
                <div className="w-full bg-secondary/30 p-2 text-center text-sm text-muted-foreground border-b">
                    You need to <Link href={loginUrl} className="text-primary hover:underline font-medium">log in</Link> or <Link href={signupUrl} className="text-primary hover:underline font-medium">sign up</Link> to run or submit
                </div>
            )}
            {/* Main Tabs (Testcase vs Result) */}
            <div className="border-b px-2 flex items-center justify-between bg-muted/30">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="h-9 bg-transparent p-0 w-full justify-start rounded-none">
                        <TabsTrigger
                            value="cases"
                            className="h-9 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-background"
                        >
                            <Code2 className="h-4 w-4 mr-2" />
                            Testcase
                        </TabsTrigger>
                        <TabsTrigger
                            value="result"
                            className={cn(
                                "h-9 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-background",
                                !verdict && "cursor-not-allowed opacity-50"
                            )}
                            disabled={!verdict}
                        >
                            <Terminal className="h-4 w-4 mr-2" />
                            Test Result
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {activeTab === "cases" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setIsAddingNew(true)}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Case
                    </Button>
                )}
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1">
                <div className="p-4">
                    {activeTab === "cases" ? (
                        /* Testcase Input View */
                        <div className="space-y-4">
                            {/* Case selector tabs */}
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                                {testcases.map((tc, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveTestCaseIndex(index)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                                            activeTestCaseIndex === index
                                                ? "bg-secondary text-secondary-foreground"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        )}
                                    >
                                        <span>Case {index + 1}</span>
                                        {tc.isModified && !tc.isUserAdded && <span className="text-orange-400">*</span>}
                                        {tc.isUserAdded && <span className="text-blue-400 text-xs">(Custom)</span>}
                                    </button>
                                ))}
                            </div>

                            {/* Add New Case Form */}
                            {isAddingNew && (
                                <div className="mb-4 p-3 border rounded-lg border-dashed bg-muted/30">
                                    <p className="text-sm font-medium mb-2">Add New Test Case</p>
                                    <textarea
                                        value={newTestcaseInput}
                                        onChange={(e) => setNewTestcaseInput(e.target.value)}
                                        className="w-full min-h-[60px] p-2 bg-background border rounded font-mono text-xs"
                                        placeholder='{"nums": [1,2,3], "target": 5}'
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" onClick={handleAddTestcase}>Add</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsAddingNew(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}

                            {/* Active Case Editor */}
                            {activeTestcase && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-muted-foreground">Input</label>
                                        <div className="flex gap-1">
                                            {activeTestcase.isModified && !activeTestcase.isUserAdded && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => resetTestcase(activeTestCaseIndex)}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" /> Reset
                                                </Button>
                                            )}
                                            {activeTestcase.isUserAdded && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeTestcase(activeTestCaseIndex)}
                                                    className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <textarea
                                        value={activeTestcase.input}
                                        onChange={(e) => updateTestcaseInput(activeTestCaseIndex, e.target.value)}
                                        className={cn(
                                            "w-full min-h-[100px] p-3 bg-muted/40 rounded-lg font-mono text-sm border resize-none focus-visible:ring-1",
                                            activeTestcase.isModified && "border-orange-400/50"
                                        )}
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Test Result View */
                        <div className="space-y-6">
                            {/* Verdict Summary */}
                            <div className="flex items-center gap-4">
                                {verdictInfo && (
                                    <h3 className={cn("text-lg font-semibold",
                                        verdictInfo.color === "green" ? "text-green-500" :
                                            verdictInfo.color === "red" ? "text-red-500" : "text-orange-500"
                                    )}>
                                        {verdictInfo.label}
                                    </h3>
                                )}
                                {runtimeMs !== null && runtimeMs !== undefined && (
                                    <span className="text-sm text-muted-foreground">Runtime: {runtimeMs}ms</span>
                                )}
                            </div>

                            {/* Compilation Error or Runtime Error (Global) */}
                            {errorMessage && !activeResult && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <h4 className="text-sm font-semibold text-red-500 mb-2">Error</h4>
                                    <pre className="text-xs font-mono whitespace-pre-wrap text-red-400">{errorMessage}</pre>
                                </div>
                            )}

                            {compilationOutput && (
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <h4 className="text-sm font-semibold text-orange-500 mb-2">Compilation Output</h4>
                                    <pre className="text-xs font-mono whitespace-pre-wrap">{compilationOutput}</pre>
                                </div>
                            )}

                            {/* Result details per case */}
                            {verdict !== "COMPILATION_ERROR" && verdict !== "INTERNAL_ERROR_RUN" && (
                                <div className="space-y-4">
                                    {/* Case Tabs for Result */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {testCaseResults?.map((res, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveTestCaseIndex(index)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                                                    activeTestCaseIndex === index
                                                        ? "bg-secondary text-secondary-foreground"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                )}
                                            >
                                                {res.passed === true && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                                {res.passed === false && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                                {res.passed === null && !res.error && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}

                                                <span>Case {index + 1}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active Result Detail */}
                                    {activeResult ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            {/* Input */}
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Input</p>
                                                <pre className="p-3 bg-muted/50 rounded-lg font-mono text-sm overflow-x-auto border">
                                                    {testcases[activeTestCaseIndex]?.input}
                                                </pre>
                                            </div>

                                            {/* Output */}
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Output</p>
                                                <pre className={cn(
                                                    "p-3 rounded-lg font-mono text-sm overflow-x-auto border",
                                                    activeResult.passed === true ? "bg-muted/50" : "bg-red-500/5 border-red-500/20"
                                                )}>
                                                    {activeResult.actualOutput || <span className="text-muted-foreground italic">(empty)</span>}
                                                </pre>
                                            </div>

                                            {/* Expected */}
                                            {activeResult.expectedOutput && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Expected</p>
                                                    <pre className="p-3 bg-muted/50 rounded-lg font-mono text-sm overflow-x-auto border">
                                                        {activeResult.expectedOutput}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Select a case to view details
                                        </div>
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
