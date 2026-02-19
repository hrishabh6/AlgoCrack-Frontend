"use client";

import { RecentSubmission } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentSubmissionsProps {
    submissions: RecentSubmission[];
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
    if (submissions.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card/50 p-8 text-center backdrop-blur-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 justify-center text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    Recent Submissions
                </h2>
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/50">
                        <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-muted-foreground">No submissions yet.</p>
                    <p className="text-xs text-muted-foreground/50">Solve some problems to see them here!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card shadow-sm flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Recent Submissions
                </h2>
                <Link 
                    href="/submissions" 
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                    View All <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-border/40">
                {submissions.map((sub) => {
                    const isAccepted = sub.verdict === "ACCEPTED";
                    const timeAgo = getRelativeTime(sub.timestamp);
                    return (
                        <div
                            key={sub.submissionId}
                            className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Status Icon */}
                                <div className={`shrink-0`}>
                                    {isAccepted ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                </div>

                                {/* Problem Info */}
                                <div className="space-y-0.5 min-w-0">
                                    <Link
                                        href={`/problems/${sub.questionSlug || sub.questionTitle.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="text-sm font-medium truncate hover:text-primary transition-colors block leading-none"
                                    >
                                        {sub.questionTitle}
                                    </Link>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span className="font-mono">
                                            {formatVerdict(sub.verdict)}
                                        </span>
                                        <span>•</span>
                                        <span>{timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function formatVerdict(verdict: string): string {
    return verdict
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
}

function getRelativeTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 5) return `${diffWeek}w ago`;
    return `${diffMonth}mo ago`;
}
