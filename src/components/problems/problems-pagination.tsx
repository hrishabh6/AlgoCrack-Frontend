"use client";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";

interface ProblemsPaginationProps {
    currentPage: number;
    totalPages: number;
}

export function ProblemsPagination({
    currentPage,
    totalPages,
}: ProblemsPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helper to create page links keeping other params
    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `/problems?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="py-4">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={createPageURL(Math.max(0, currentPage - 1))}
                            aria-disabled={currentPage <= 0}
                            className={currentPage <= 0 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>

                    {/* First Page */}
                    {currentPage > 1 && (
                        <PaginationItem>
                            <PaginationLink href={createPageURL(0)}>1</PaginationLink>
                        </PaginationItem>
                    )}

                    {currentPage > 2 && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}

                    {/* Current Page Window */}
                    <PaginationItem>
                        <PaginationLink href={createPageURL(currentPage)} isActive>
                            {currentPage + 1}
                        </PaginationLink>
                    </PaginationItem>

                    {currentPage < totalPages - 2 && (
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                    )}

                    {currentPage < totalPages - 1 && (
                        <PaginationItem>
                            <PaginationLink href={createPageURL(totalPages - 1)}>
                                {totalPages}
                            </PaginationLink>
                        </PaginationItem>
                    )}

                    <PaginationItem>
                        <PaginationNext
                            href={createPageURL(Math.min(totalPages - 1, currentPage + 1))}
                            aria-disabled={currentPage >= totalPages - 1}
                            className={
                                currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : ""
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
