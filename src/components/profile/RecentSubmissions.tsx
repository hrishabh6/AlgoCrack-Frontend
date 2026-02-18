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
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-xl overflow-hidden shadow-lg flex flex-col relative group">
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    Recent Submissions
                </h2>
                <div className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border/50">
                    Last {submissions.length} activities
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-border/50">
                {submissions.map((sub, index) => {
                    const isAccepted = sub.verdict === "ACCEPTED";
                    const timeAgo = getRelativeTime(sub.timestamp);
                    return (
                        <div
                            key={sub.submissionId}
                            className="group/row relative flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                             {/* Hover Highlight Line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isAccepted ? 'bg-green-500/0 group-hover/row:bg-green-500' : 'bg-red-500/0 group-hover/row:bg-red-500'}`} />

                            <div className="flex items-center gap-4 min-w-0 pl-2">
                                {/* Status Icon */}
                                <div className={`shrink-0 p-2 rounded-full ${isAccepted ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {isAccepted ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <XCircle className="h-5 w-5" />
                                    )}
                                </div>

                                {/* Problem Info */}
                                <div className="space-y-1 min-w-0">
                                    <Link
                                        href={`/problems/${sub.questionSlug || sub.questionTitle.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="text-base font-semibold truncate hover:text-primary transition-colors block"
                                    >
                                        {sub.questionTitle}
                                    </Link>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={`font-mono px-1.5 py-0.5 rounded ${isAccepted ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {formatVerdict(sub.verdict)}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/problems/${sub.questionSlug || sub.questionTitle.toLowerCase().replace(/\s+/g, '-')}`}
                                className="opacity-0 group-hover/row:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* View All Button */}
            <button className="p-4 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors text-center border-t border-border/50 uppercase tracking-widest">
                View All Submissions
            </button>
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
