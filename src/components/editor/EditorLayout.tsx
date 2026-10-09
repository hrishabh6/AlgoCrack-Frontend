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
import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFocusMode } from "@/hooks/useFocusMode";
import { useWorkspaceFullscreenState } from "@/hooks/useWorkspaceFullscreen";
import { shouldHideAppChrome } from "@/lib/focus-mode/routes";
import { usePathname } from "next/navigation";
import { FocusModeBar } from "@/components/focus-mode/FocusModeBar";
import { useWorkspaceLayout } from "@/components/focus-mode/WorkspaceLayoutContext";
import {
    exitDocumentFullscreen,
    getProblemWorkspace,
    registerProblemWorkspace,
    WORKSPACE_FULLSCREEN_ATTR,
} from "@/lib/focus-mode/fullscreen";
import { applyMaximizedLayout, isPanelHidden } from "@/lib/focus-mode/panels";
import { cn } from "@/lib/utils";
import type { ImperativePanelHandle } from "react-resizable-panels";

interface EditorLayoutProps {
    problem: QuestionDetail;
    testCases: TestCase[];
    /** When set and equal to the loaded problem id, show the daily challenge badge. */
    dailyChallengeProblemId?: number | null;
}

function Pane({
    children,
    flush,
    hidden,
}: {
    children: React.ReactNode;
    flush?: boolean;
    hidden?: boolean;
}) {
    return (
        <div
            inert={hidden ? true : undefined}
            className={cn(
                "flex h-full min-h-0 flex-col overflow-hidden bg-card",
                flush ? "rounded-none" : "rounded-lg border"
            )}
        >
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
    const pathname = usePathname();
    const { isActive: focusModeActive } = useFocusMode();
    const { active: workspaceFullscreen } = useWorkspaceFullscreenState();
    const { maximizedPanel } = useWorkspaceLayout();
    const focusChromeHidden = shouldHideAppChrome(pathname, focusModeActive);
    const immersive = focusChromeHidden || workspaceFullscreen;
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const direction = isDesktop ? "horizontal" : "vertical";
    const rootRef = useRef<HTMLDivElement>(null);
    const problemRef = useRef<ImperativePanelHandle>(null);
    const rightRef = useRef<ImperativePanelHandle>(null);
    const editorRef = useRef<ImperativePanelHandle>(null);
    const consoleRef = useRef<ImperativePanelHandle>(null);

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

    useEffect(() => {
        const element = rootRef.current;
        registerProblemWorkspace(element);
        return () => {
            if (typeof document !== "undefined" && document.fullscreenElement === element) {
                void exitDocumentFullscreen();
            }
            if (getProblemWorkspace() === element) {
                registerProblemWorkspace(null);
            }
        };
    }, []);

    useEffect(() => {
        const problem = problemRef.current;
        const right = rightRef.current;
        const editor = editorRef.current;
        const consolePanel = consoleRef.current;
        if (!problem || !right || !editor || !consolePanel) return;
        applyMaximizedLayout(
            { problem, right, editor, console: consolePanel },
            maximizedPanel
        );
    }, [maximizedPanel, isDesktop]);

    return (
        <div
            ref={rootRef}
            {...{ [WORKSPACE_FULLSCREEN_ATTR]: "" }}
            className={cn(
                "flex w-full min-h-0 flex-col overflow-hidden bg-background",
                immersive ? "h-dvh w-full p-0" : "h-[calc(100dvh-3rem)] p-1.5"
            )}
        >
            {focusChromeHidden && <FocusModeBar />}
            <ResizablePanelGroup key={direction} direction={direction} className="min-h-0 flex-1 w-full">
                {/* Left Panel: Problem Description */}
                <ResizablePanel
                    ref={problemRef}
                    id="problem"
                    order={1}
                    collapsible
                    collapsedSize={0}
                    defaultSize={isDesktop ? 42 : 40}
                    minSize={isDesktop ? 25 : 15}
                    maxSize={100}
                >
                    <Pane flush={immersive} hidden={isPanelHidden("problem", maximizedPanel)}>
                        <ProblemDescription dailyChallengeProblemId={dailyChallengeProblemId} />
                    </Pane>
                </ResizablePanel>

                <ResizableHandle withHandle className={cn(maximizedPanel && "hidden")} />

                {/* Right Panel: Code Editor & Test Cases */}
                <ResizablePanel ref={rightRef} id="editor-column" order={2} collapsible collapsedSize={0} defaultSize={isDesktop ? 58 : 60} minSize={25}>
                    <ResizablePanelGroup direction="vertical">
                        {/* Top: Code Editor */}
                        <ResizablePanel
                            ref={editorRef}
                            id="editor"
                            order={1}
                            collapsible
                            collapsedSize={0}
                            defaultSize={65}
                            minSize={25}
                        >
                            <Pane flush={immersive} hidden={isPanelHidden("editor", maximizedPanel)}>
                                <EditorToolbar />
                                <CodeEditor />
                            </Pane>
                        </ResizablePanel>

                        <ResizableHandle withHandle className={cn(maximizedPanel && "hidden")} />

                        {/* Bottom: Test Cases / Results */}
                        <ResizablePanel
                            ref={consoleRef}
                            id="console"
                            order={2}
                            collapsible
                            collapsedSize={0}
                            defaultSize={35}
                            minSize={12}
                        >
                            <Pane flush={immersive} hidden={isPanelHidden("console", maximizedPanel)}>
                                <TestCasesPanel />
                            </Pane>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
