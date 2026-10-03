"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProblemsPaginationProps {
    currentPage: number;
    totalPages: number;
}

/** Zero-based page indexes to render, with `null` marking an ellipsis gap. */
function pageWindow(current: number, total: number): Array<number | null> {
    const pages = new Set<number>([0, total - 1, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 0 && p < total).sort((a, b) => a - b);
    const result: Array<number | null> = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) result.push(null);
        result.push(p);
    });
    return result;
}

export function ProblemsPagination({
    currentPage,
    totalPages,
}: ProblemsPaginationProps) {
    const searchParams = useSearchParams();

    // Helper to create page links keeping other params
    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `/problems?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    const isFirst = currentPage <= 0;
    const isLast = currentPage >= totalPages - 1;
    const navClass = buttonVariants({ variant: "ghost", size: "sm" });

    return (
        <nav
            aria-label="Pagination"
            className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row"
        >
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
                <Link
                    href={createPageURL(Math.max(0, currentPage - 1))}
                    aria-disabled={isFirst}
                    tabIndex={isFirst ? -1 : undefined}
                    className={cn(navClass, isFirst && "pointer-events-none opacity-40")}
                >
                    <ChevronLeft />
                    <span className="hidden sm:inline">Previous</span>
                </Link>
                {pageWindow(currentPage, totalPages).map((page, i) =>
                    page === null ? (
                        <span key={`gap-${i}`} className="px-1 text-xs text-subtle-foreground" aria-hidden="true">
                            …
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={createPageURL(page)}
                            aria-current={page === currentPage ? "page" : undefined}
                            className={cn(
                                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                                "font-mono text-xs tabular-nums",
                                page === currentPage &&
                                    "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                            )}
                        >
                            {page + 1}
                        </Link>
                    )
                )}
                <Link
                    href={createPageURL(Math.min(totalPages - 1, currentPage + 1))}
                    aria-disabled={isLast}
                    tabIndex={isLast ? -1 : undefined}
                    className={cn(navClass, isLast && "pointer-events-none opacity-40")}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight />
                </Link>
            </div>
        </nav>
    );
}
