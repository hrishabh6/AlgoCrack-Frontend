"use client";

import { useEffect, useState } from "react";
import { useEditorStore, useUserStore } from "@/store"; // Assuming useUserStore is exported from store
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { SubmissionDetail } from "@/types";
import { Loader2, Clock, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function SubmissionsList() {
    const { currentProblem } = useEditorStore();
    // Assuming useUserStore has userId or username. Based on previous context, userId is number, username is string.
    // The API requires userId but the mock shows a string like "hrishabh_joshi...".
    // We will use userId if available, converted to string, or username.
    const userId = useUserStore((state) => state.userId);
    const username = useUserStore((state) => state.username);

    const [submissions, setSubmissions] = useState<SubmissionDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId && !username) return;
        if (!currentProblem) return;

        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                // Determine the ID to use based on what's available. 
                // If the user store has a numeric ID, we use that. 
                // If standard practice is string username for public profile URLs or similar APIs, we might use username.
                // Given the mock data "userId": "hrishabh_joshi...", let's try calling with username first if it looks like a slug.
                // However, conventionally APIs use the stable ID.
                const idToUse = userId || username;

                // Fetch submissions for the specific user and problem
                const response = await apiClient.get<SubmissionDetail[]>(
                    `${ENDPOINTS.SUBMISSIONS}/user/${idToUse}?page=0&size=20&questionId=${currentProblem.id}`
                );

                const filtered = Array.isArray(response) ? response : [];

                // Sort by date descending
                filtered.sort((a, b) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime());

                setSubmissions(filtered);
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
                setError("Failed to load submissions");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [userId, username, currentProblem]);

    if (!userId && !username) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <p>Please log in to view submissions.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center p-8 text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <p>No submissions found.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col min-w-full">
                {/* Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 p-4 border-b text-xs font-medium text-muted-foreground bg-muted/40 sticky top-0 z-10">
                    <div>Status</div>
                    <div>Language</div>
                    <div>Runtime</div>
                    <div>Memory</div>
                </div>

                {/* Rows */}
                {submissions.map((sub) => {
                    const isAccepted = sub.verdict === "ACCEPTED";
                    const isError = sub.verdict && sub.verdict !== "ACCEPTED";

                    let statusColor = "text-muted-foreground";
                    if (isAccepted) statusColor = "text-green-500";
                    if (isError) statusColor = "text-red-500";
                    if (!sub.verdict && sub.status === "COMPLETED") statusColor = "text-green-500"; // Fallback

                    // Format date
                    const dateObj = new Date(sub.completedAt || sub.queuedAt);
                    const dateStr = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });

                    // Format verdict text
                    const verdictText = sub.verdict
                        ? sub.verdict.replace(/_/g, " ").split(" ").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")
                        : sub.status;

                    return (
                        <div key={sub.submissionId} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 p-4 border-b hover:bg-muted/20 transition-colors text-sm items-center">
                            {/* Status Column */}
                            <div className="flex flex-col">
                                <span className={cn("font-medium", statusColor)}>
                                    {verdictText}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">{dateStr}</span>
                            </div>

                            {/* Language Column */}
                            <div>
                                <Badge variant="secondary" className="rounded-full bg-muted/50 text-xs font-normal text-muted-foreground hover:bg-muted font-mono px-2 py-0.5 border">
                                    {sub.language}
                                </Badge>
                            </div>

                            {/* Runtime Column */}
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                {sub.runtimeMs !== null ? (
                                    <>
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{sub.runtimeMs} ms</span>
                                    </>
                                ) : (
                                    <span>N/A</span>
                                )}
                            </div>

                            {/* Memory Column */}
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                {sub.memoryKb !== null ? (
                                    <>
                                        <Cpu className="h-3.5 w-3.5" />
                                        <span>{(sub.memoryKb / 1024).toFixed(1)} MB</span>
                                    </>
                                ) : (
                                    <span>N/A</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
