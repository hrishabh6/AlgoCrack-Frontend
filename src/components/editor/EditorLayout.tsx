"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ProblemDescription } from "./ProblemDescription";
import { CodeEditor } from "./CodeEditor";
import { TestCasesPanel } from "./TestCasesPanel";
import { EditorToolbar } from "./EditorToolbar";
import { useEditorStore, useSubmissionStore, useUserStore } from "@/store";
import { QuestionDetail, TestCase } from "@/types";
import { useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EditorLayoutProps {
    problem: QuestionDetail;
    testCases: TestCase[];
    /** When set and equal to the loaded problem id, show the daily challenge badge. */
    dailyChallengeProblemId?: number | null;
}

function Pane({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
            {children}
        </div>
    );
}

export function EditorLayout({ problem, testCases, dailyChallengeProblemId = null }: EditorLayoutProps) {
    const { 
        setProblem, 
        initializeTestcases, 
        language, 
        setLanguage 
    } = useEditorStore();
    const { reset: resetSubmission } = useSubmissionStore();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const direction = isDesktop ? "horizontal" : "vertical";

    // Listen for user changes to reload code from local storage
    const userId = useUserStore((state) => state.userId);

    useEffect(() => {
        if (problem) { // 'problem' here refers to the prop passed to EditorLayout
            // Trigger reload of code for the new user context
            setLanguage(language);
        }
    }, [userId, problem, language, setLanguage]);

    useEffect(() => {
        setProblem(problem);
        initializeTestcases(testCases);
        resetSubmission();
    }, [problem, testCases, setProblem, initializeTestcases, resetSubmission]);

    return (
        <div className="flex h-[calc(100dvh-3rem)] w-full flex-col overflow-hidden bg-background p-1.5">
            <ResizablePanelGroup key={direction} direction={direction} className="h-full w-full">
                {/* Left Panel: Problem Description */}
                <ResizablePanel defaultSize={isDesktop ? 42 : 40} minSize={isDesktop ? 25 : 15} maxSize={75}>
                    <Pane>
                        <ProblemDescription dailyChallengeProblemId={dailyChallengeProblemId} />
                    </Pane>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Panel: Code Editor & Test Cases */}
                <ResizablePanel defaultSize={isDesktop ? 58 : 60}>
                    <ResizablePanelGroup direction="vertical">
                        {/* Top: Code Editor */}
                        <ResizablePanel defaultSize={65} minSize={25}>
                            <Pane>
                                <EditorToolbar />
                                <CodeEditor />
                            </Pane>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Bottom: Test Cases / Results */}
                        <ResizablePanel defaultSize={35} minSize={12}>
                            <Pane>
                                <TestCasesPanel />
                            </Pane>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
