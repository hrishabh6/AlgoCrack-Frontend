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
import { useEditorStore } from "@/store";
import { QuestionDetail, TestCase } from "@/types";
import { useEffect } from "react";

interface EditorLayoutProps {
    problem: QuestionDetail;
    testCases: TestCase[];
}

export function EditorLayout({ problem, testCases }: EditorLayoutProps) {
    const { setProblem, initializeTestcases } = useEditorStore();

    useEffect(() => {
        setProblem(problem);
        initializeTestcases(testCases);
    }, [problem, testCases, setProblem, initializeTestcases]);

    return (
        <div className="h-[calc(100vh-3.5rem)] w-full overflow-hidden flex flex-col relative">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                {/* Left Panel: Problem Description */}
                <ResizablePanel defaultSize={40} minSize={25} maxSize={75}>
                    <ProblemDescription />
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right Panel: Code Editor & Test Cases */}
                <ResizablePanel defaultSize={60}>
                    <ResizablePanelGroup direction="vertical">
                        {/* Top: Code Editor */}
                        <ResizablePanel defaultSize={70} minSize={30}>
                            <div className="flex flex-col h-full">
                                <EditorToolbar />
                                <CodeEditor />
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Bottom: Test Cases / Results */}
                        <ResizablePanel defaultSize={30} minSize={10}>
                            <TestCasesPanel />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
