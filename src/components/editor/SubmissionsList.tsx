"use client";

import { useEffect, useState } from "react";
import { useEditorStore, useUserStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { SubmissionDetail } from "@/types";
import { History, LogIn } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, StatusBadge, TagChip } from "@/components/shared";
import { formatMemoryKb } from "@/lib/verdict";

export function SubmissionsList() {
    const { currentProblem } = useEditorStore();
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
            <EmptyState
                icon={<LogIn />}
                title="Sign in to see submissions"
                description="Your submissions for this problem will appear here."
                className="h-full"
            />
        );
    }

    if (loading) {
        return (
            <div className="space-y-2 p-4" aria-busy="true" aria-label="Loading submissions">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return <EmptyState tone="error" title="Couldn't load submissions" description={error} className="h-full" />;
    }

    if (submissions.length === 0) {
        return (
            <EmptyState
                icon={<History />}
                title="No submissions yet"
                description="Submit a solution to see it here."
                className="h-full"
            />
        );
    }

    return (
        <ScrollArea className="h-full">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-surface-2">
                    <tr className="border-b text-left text-xs text-muted-foreground">
                        <th scope="col" className="px-4 py-2 font-medium">Status</th>
                        <th scope="col" className="px-3 py-2 font-medium">Language</th>
                        <th scope="col" className="px-3 py-2 text-right font-medium">Runtime</th>
                        <th scope="col" className="px-4 py-2 text-right font-medium">Memory</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((sub) => {
                        const dateObj = new Date(sub.completedAt || sub.queuedAt);
                        const dateStr = dateObj.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });

                        return (
                            <tr key={sub.submissionId} className="border-b border-border/70 transition-colors hover:bg-accent/40">
                                <td className="px-4 py-2.5">
                                    <div className="flex flex-col items-start gap-1">
                                        <StatusBadge verdict={sub.verdict} status={sub.status} />
                                        <span className="text-[11px] text-subtle-foreground">{dateStr}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <TagChip mono>{sub.language}</TagChip>
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                                    {sub.runtimeMs !== null ? `${sub.runtimeMs} ms` : "—"}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                                    {formatMemoryKb(sub.memoryKb) ?? "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </ScrollArea>
    );
}
