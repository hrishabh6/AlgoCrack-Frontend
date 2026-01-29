"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/store";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FileText, Calculator, History, Activity } from "lucide-react";
import { SubmissionResult } from "./SubmissionResult";

export function ProblemDescription() {
    const { currentProblem, activeTab, setActiveTab } = useEditorStore();

    if (!currentProblem) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                Loading problem...
            </div>
        );
    }

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
                        <div className="p-4">
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

                            <div className="mt-6 prose prose-invert max-w-none">
                                <div
                                    dangerouslySetInnerHTML={{ __html: currentProblem.questionDescription }}
                                />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold">Constraints:</h3>
                                <div
                                    className="mt-2 rounded-md bg-muted p-4 text-sm font-mono"
                                    dangerouslySetInnerHTML={{ __html: currentProblem.constraints }}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="solutions" className="flex-1 p-4 m-0">
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>Solutions will be available after submission.</p>
                    </div>
                </TabsContent>

                <TabsContent value="submissions" className="flex-1 p-4 m-0">
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>No submissions yet.</p>
                    </div>
                </TabsContent>

                <TabsContent value="results" className="flex-1 p-0 m-0 h-full">
                     <SubmissionResult />
                </TabsContent>
            </Tabs>
        </div>
    );
}
