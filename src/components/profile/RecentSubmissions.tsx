"use client";

import { RecentSubmission } from "@/types";
import { ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { problemPath } from "@/lib/slug-utils";
import { EmptyState, StatusBadge } from "@/components/shared";
import { formatRelativeTime } from "@/lib/verdict";

interface RecentSubmissionsProps {
    submissions: RecentSubmission[];
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Recent submissions</h2>
                <Link
                    href="/submissions"
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                    View all <ArrowRight className="size-3" />
                </Link>
            </div>

            {submissions.length === 0 ? (
                <EmptyState
                    icon={<History />}
                    title="No submissions yet"
                    description="Solve some problems to see them here."
                    action={
                        <Link href="/problems" className="text-sm font-medium text-primary hover:underline">
                            Browse problems
                        </Link>
                    }
                />
            ) : (
                <ul className="divide-y">
                    {submissions.map((sub) => (
                        <li
                            key={sub.submissionId}
                            className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-accent/40"
                        >
                            <Link
                                href={sub.questionId
                                    ? problemPath(sub.questionTitle, sub.questionId)
                                    : `/problems/${sub.questionSlug || sub.questionTitle.toLowerCase().replace(/\s+/g, '-')}`}
                                className="min-w-0 truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                                {sub.questionTitle}
                            </Link>
                            <div className="flex shrink-0 items-center gap-3">
                                <StatusBadge verdict={sub.verdict} showIcon={false} />
                                <time
                                    dateTime={sub.timestamp}
                                    title={new Date(sub.timestamp).toLocaleString()}
                                    className="w-14 text-right font-mono text-[11px] tabular-nums text-subtle-foreground"
                                >
                                    {formatRelativeTime(sub.timestamp)}
                                </time>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
