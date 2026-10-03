"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, History, LogIn, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserSubmissions } from "@/lib/api/submission-service";
import { formatMemoryKb, formatRelativeTime } from "@/lib/verdict";
import type { SubmissionDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState, PageContainer, PageHeader, StatusBadge, TagChip } from "@/components/shared";

const PAGE_SIZE = 20;

export default function SubmissionsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [page, setPage] = useState(0);
    const [submissions, setSubmissions] = useState<SubmissionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const userId = user?.userId;

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !userId) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getUserSubmissions(String(userId), undefined, page, PAGE_SIZE);
                if (!cancelled) setSubmissions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
                if (!cancelled) setError("Failed to load submissions. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [authLoading, isAuthenticated, userId, page, reloadKey]);

    const hasNext = submissions.length === PAGE_SIZE;

    return (
        <PageContainer>
            <PageHeader title="Submissions" description="Your submission history across all problems." />

            <div className="mt-6">
                {authLoading || (loading && isAuthenticated) ? (
                    <SubmissionsSkeleton />
                ) : !isAuthenticated ? (
                    <div className="rounded-lg border bg-card">
                        <EmptyState
                            icon={<LogIn />}
                            title="Sign in to view your submissions"
                            description="Your submission history will appear here once you're signed in."
                            action={
                                <Button asChild size="sm">
                                    <Link href={`/auth/signin?next=${encodeURIComponent("/submissions")}`}>Sign in</Link>
                                </Button>
                            }
                        />
                    </div>
                ) : error ? (
                    <div className="rounded-lg border bg-card">
                        <EmptyState
                            tone="error"
                            title="Couldn't load submissions"
                            description={error}
                            action={
                                <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
                                    <RotateCcw />
                                    Try again
                                </Button>
                            }
                        />
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="rounded-lg border bg-card">
                        <EmptyState
                            icon={<History />}
                            title={page === 0 ? "No submissions yet" : "No more submissions"}
                            description={
                                page === 0
                                    ? "Solve a problem and submit it to start building your history."
                                    : "You've reached the end of your history."
                            }
                            action={
                                page === 0 ? (
                                    <Button asChild size="sm">
                                        <Link href="/problems">Browse problems</Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))}>
                                        <ChevronLeft />
                                        Previous page
                                    </Button>
                                )
                            }
                        />
                    </div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-lg border bg-card">
                            <Table className="lg:table-fixed">
                                <TableHeader className="bg-surface-2">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-4 lg:w-44">Status</TableHead>
                                        <TableHead>Problem</TableHead>
                                        <TableHead className="hidden sm:table-cell lg:w-32">Language</TableHead>
                                        <TableHead className="text-right lg:w-28">Runtime</TableHead>
                                        <TableHead className="hidden text-right md:table-cell lg:w-28">Memory</TableHead>
                                        <TableHead className="hidden text-right md:table-cell lg:w-24">Tests</TableHead>
                                        <TableHead className="pr-4 text-right lg:w-36">Submitted</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((sub) => {
                                        const submittedAt = sub.completedAt || sub.queuedAt;
                                        const hasCounts =
                                            typeof sub.passedTestCases === "number" &&
                                            typeof sub.totalTestCases === "number";
                                        return (
                                            <TableRow key={sub.submissionId}>
                                                <TableCell className="pl-4">
                                                    <StatusBadge verdict={sub.verdict} status={sub.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/problems/${sub.questionId}`}
                                                        className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                                                    >
                                                        Problem{" "}
                                                        <span className="font-mono text-muted-foreground">#{sub.questionId}</span>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <TagChip mono>{sub.language}</TagChip>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                                                    {sub.runtimeMs !== null ? `${sub.runtimeMs} ms` : "—"}
                                                </TableCell>
                                                <TableCell className="hidden text-right font-mono text-xs tabular-nums text-muted-foreground md:table-cell">
                                                    {formatMemoryKb(sub.memoryKb) ?? "—"}
                                                </TableCell>
                                                <TableCell className="hidden text-right font-mono text-xs tabular-nums text-muted-foreground md:table-cell">
                                                    {hasCounts ? `${sub.passedTestCases}/${sub.totalTestCases}` : "—"}
                                                </TableCell>
                                                <TableCell
                                                    className="pr-4 text-right text-xs text-muted-foreground"
                                                    title={submittedAt ? new Date(submittedAt).toLocaleString() : undefined}
                                                >
                                                    {formatRelativeTime(submittedAt)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {(page > 0 || hasNext) && (
                            <nav aria-label="Pagination" className="mt-4 flex items-center justify-between">
                                <p className="font-mono text-xs tabular-nums text-muted-foreground">Page {page + 1}</p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        <ChevronLeft />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={!hasNext}
                                    >
                                        Next
                                        <ChevronRight />
                                    </Button>
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
}

function SubmissionsSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border bg-card" aria-busy="true" aria-label="Loading submissions">
            <div className="h-9 border-b bg-surface-2" />
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex h-12 items-center gap-6 border-b border-border/70 px-4 last:border-0">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="ml-auto h-3 w-12" />
                    <Skeleton className="hidden h-3 w-14 md:block" />
                    <Skeleton className="h-3 w-14" />
                </div>
            ))}
        </div>
    );
}
