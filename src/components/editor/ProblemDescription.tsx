"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionsList } from "./SubmissionsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/store";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FileText, Calculator, History, Activity } from "lucide-react";
import { SubmissionResult } from "./SubmissionResult";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { parseProblemDescription } from "@/lib/problem-utils";
import "highlight.js/styles/atom-one-dark.css"; // Import highlight.js style

export function ProblemDescription() {
    const { currentProblem, activeTab, setActiveTab } = useEditorStore();

    if (!currentProblem) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Loading problem...
            </div>
        );
    }

    // Parse the description to separate main text from examples
    const { description, examples } = parseProblemDescription(currentProblem.questionDescription || "");

    return (
        <div className="flex h-full flex-col bg-background">
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="flex h-full flex-col"
            >
                <div className="border-b px-4">
                    <TabsList className="h-10 bg-transparent p-0">
                        <TabsTrigger
                            value="description"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Description
                        </TabsTrigger>
                        <TabsTrigger
                            value="solutions"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Calculator className="mr-2 h-4 w-4" />
                            Solutions
                        </TabsTrigger>
                        <TabsTrigger
                            value="submissions"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <History className="mr-2 h-4 w-4" />
                            Submissions
                        </TabsTrigger>
                        <TabsTrigger
                            value="results"
                            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                            <Activity className="mr-2 h-4 w-4" />
                            Results
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="description" className="flex-1 p-0 m-0 h-full">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-6 pb-24">
                            {/* Title & difficulty */}
                            <div>
                                <h1 className="text-2xl font-bold">{currentProblem.questionTitle}</h1>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            DIFFICULTY_COLORS[currentProblem.difficultyLevel]
                                        )}
                                    >
                                        {currentProblem.difficultyLevel}
                                    </Badge>
                                    {currentProblem.tags?.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Main Description */}
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                >
                                    {description}
                                </ReactMarkdown>
                            </div>

                            {/* Examples */}
                            {examples.length > 0 && (
                                <div className="space-y-4">
                                    {examples.map((example, index) => (
                                        <div key={index} className="rounded-lg border bg-muted/30 p-4">
                                            <h3 className="font-semibold text-base mb-2">{example.title}</h3>

                                            <div className="space-y-2 text-sm">
                                                {example.inputText && (
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold min-w-24">Input:</span>
                                                        <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">{example.inputText}</code>
                                                    </div>
                                                )}
                                                {example.outputText && (
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold min-w-24">Output:</span>
                                                        <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">{example.outputText}</code>
                                                    </div>
                                                )}
                                                {example.explanation && (
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold min-w-24">Explanation:</span>
                                                        <span className="text-muted-foreground">{example.explanation}</span>
                                                    </div>
                                                )}

                                                {/* Fallback if parsing failed to extract specific fields but there is content */}
                                                {!example.inputText && !example.outputText && example.text && (
                                                    <div className="prose prose-invert max-w-none text-sm">
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
                                </div>
                            )}

                            {/* Constraints */}
                            {currentProblem.constraints && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
                                    <div className="rounded-md bg-muted p-4 text-sm font-mono">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                        >
                                            {currentProblem.constraints}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="solutions" className="flex-1 p-4 m-0">
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>Solutions will be available after submission.</p>
                    </div>
                </TabsContent>

                <TabsContent value="submissions" className="flex-1 p-0 m-0 h-full">
                    <SubmissionsList />
                </TabsContent>

                <TabsContent value="results" className="flex-1 p-0 m-0 h-full">
                    <SubmissionResult />
                </TabsContent>
            </Tabs>
        </div>
    );
}
