"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionsList } from "./SubmissionsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useEditorStore } from "@/store";
import { FileText, BookOpen, History, Activity, Building2 } from "lucide-react";
import { SubmissionResult } from "./SubmissionResult";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { parseProblemDescription } from "@/lib/problem-utils";
import { DifficultyBadge, EmptyState, TagChip } from "@/components/shared";
import "highlight.js/styles/atom-one-dark.css"; // Import highlight.js style

import { workspaceTabTrigger } from "./workspace-styles";

type DescriptionTab = "description" | "solutions" | "submissions" | "results";

const proseClass = "prose prose-sm dark:prose-invert problem-prose max-w-none";

export function ProblemDescription() {
    const { currentProblem, activeTab, setActiveTab } = useEditorStore();

    if (!currentProblem) {
        return (
            <div className="space-y-4 p-5" aria-busy="true" aria-label="Loading problem">
                <Skeleton className="h-6 w-2/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-11/12" />
                <Skeleton className="h-3.5 w-4/5" />
            </div>
        );
    }

    // Parse the description to separate main text from examples
    const { description, examples } = parseProblemDescription(currentProblem.questionDescription || "");

    return (
        <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as DescriptionTab)}
            className="flex h-full min-h-0 flex-col gap-0"
        >
            <div className="shrink-0 overflow-x-auto border-b bg-surface-2 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="h-10 w-max justify-start gap-0 rounded-none bg-transparent p-0">
                    <TabsTrigger value="description" className={workspaceTabTrigger}>
                        <FileText />
                        Description
                    </TabsTrigger>
                    <TabsTrigger value="solutions" className={workspaceTabTrigger}>
                        <BookOpen />
                        Solutions
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className={workspaceTabTrigger}>
                        <History />
                        Submissions
                    </TabsTrigger>
                    <TabsTrigger value="results" className={workspaceTabTrigger}>
                        <Activity />
                        Results
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="description" className="m-0 min-h-0 flex-1 p-0">
                <ScrollArea className="h-full">
                    <article className="space-y-6 px-5 pb-16 pt-5">
                        {/* Title & difficulty */}
                        <header className="space-y-3">
                            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                <span className="mr-2 font-mono text-base font-normal text-subtle-foreground">
                                    {currentProblem.id}.
                                </span>
                                {currentProblem.questionTitle}
                            </h1>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <DifficultyBadge difficulty={currentProblem.difficultyLevel} />
                                {currentProblem.company && (
                                    <TagChip className="gap-1">
                                        <Building2 className="size-3" aria-hidden="true" />
                                        {currentProblem.company}
                                    </TagChip>
                                )}
                                {currentProblem.tags?.map((tag) => (
                                    <TagChip key={tag}>{tag}</TagChip>
                                ))}
                            </div>
                        </header>

                        {/* Main Description */}
                        <div className={proseClass}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {description}
                            </ReactMarkdown>
                        </div>

                        {/* Examples */}
                        {examples.length > 0 && (
                            <section className="space-y-3" aria-label="Examples">
                                {examples.map((example, index) => (
                                    <div key={index} className="space-y-2">
                                        <h3 className="text-[13px] font-semibold text-foreground">{example.title}</h3>

                                        <div className="space-y-1.5 rounded-md border border-l-2 border-l-border-strong bg-muted/60 px-3 py-2.5 text-[13px]">
                                            {example.inputText && (
                                                <ExampleRow label="Input" value={example.inputText} mono />
                                            )}
                                            {example.outputText && (
                                                <ExampleRow label="Output" value={example.outputText} mono />
                                            )}
                                            {example.explanation && (
                                                <ExampleRow label="Explanation" value={example.explanation} />
                                            )}

                                            {/* Fallback if parsing failed to extract specific fields but there is content */}
                                            {!example.inputText && !example.outputText && example.text && (
                                                <div className={proseClass}>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeHighlight]}
                                                    >
                                                        {example.text.replace(example.title, "").trim()}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Constraints */}
                        {currentProblem.constraints && (
                            <section className="space-y-2" aria-label="Constraints">
                                <h3 className="text-[13px] font-semibold text-foreground">Constraints</h3>
                                <div className={`${proseClass} [&_li]:my-0.5 [&_code]:text-[12px]`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                    >
                                        {currentProblem.constraints}
                                    </ReactMarkdown>
                                </div>
                            </section>
                        )}
                    </article>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="solutions" className="m-0 min-h-0 flex-1 p-0">
                <EmptyState
                    icon={<BookOpen />}
                    title="No solutions yet"
                    description="Solutions will be available after submission."
                    className="h-full"
                />
            </TabsContent>

            <TabsContent value="submissions" className="m-0 min-h-0 flex-1 p-0">
                <SubmissionsList />
            </TabsContent>

            <TabsContent value="results" className="m-0 min-h-0 flex-1 p-0">
                <SubmissionResult />
            </TabsContent>
        </Tabs>
    );
}

function ExampleRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground sm:pt-px">{label}</span>
            <span className={mono ? "whitespace-pre-wrap break-all font-mono text-[12.5px] text-foreground" : "text-foreground/85"}>
                {value}
            </span>
        </div>
    );
}
