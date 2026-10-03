"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DifficultyBadge, EmptyState, TagChip } from "@/components/shared";
import { QuestionSummary } from "@/types";
import { problemPath } from "@/lib/slug-utils";

interface ProblemsTableProps {
  questions: QuestionSummary[];
}

const MAX_TAGS = 3;

export function ProblemsTable({ questions }: ProblemsTableProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-lg border bg-card animate-in fade-in-50">
        <EmptyState
          icon={<SearchX />}
          title="No problems found"
          description="No problems match your current filters. Try adjusting them."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/problems">Clear filters</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader className="bg-surface-2">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 pl-4">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-28">Difficulty</TableHead>
            <TableHead className="hidden w-28 text-right md:table-cell">Acceptance</TableHead>
            <TableHead className="hidden lg:table-cell">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id} className="group">
              <TableCell className="pl-4 font-mono text-xs tabular-nums text-subtle-foreground">
                {question.id}
              </TableCell>
              <TableCell className="max-w-0 w-full">
                <Link
                  href={problemPath(question.questionTitle, question.id)}
                  className="block truncate py-0.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary focus-visible:text-primary"
                >
                  {question.questionTitle}
                </Link>
              </TableCell>
              <TableCell>
                <DifficultyBadge difficulty={question.difficultyLevel} />
              </TableCell>
              <TableCell className="hidden text-right font-mono text-xs tabular-nums text-muted-foreground md:table-cell">
                {question.acceptanceRate ? `${question.acceptanceRate.toFixed(1)}%` : "—"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                  {question.tags && question.tags.length > 0 ? (
                    question.tags.slice(0, MAX_TAGS).map((tag) => <TagChip key={tag}>{tag}</TagChip>)
                  ) : (
                    <span className="text-xs text-subtle-foreground">—</span>
                  )}
                  {question.tags && question.tags.length > MAX_TAGS && (
                    <TagChip
                      className="bg-transparent"
                      title={question.tags.slice(MAX_TAGS).join(", ")}
                    >
                      +{question.tags.length - MAX_TAGS}
                    </TagChip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ProblemsTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card" aria-busy="true" aria-label="Loading problems">
      <div className="flex h-9 items-center gap-4 border-b bg-surface-2 px-4">
        <Skeleton className="h-3 w-6" />
        <Skeleton className="h-3 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex h-11 items-center gap-4 border-b border-border/70 px-4 last:border-0">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3.5 flex-1 max-w-xs" style={{ maxWidth: `${40 + ((i * 37) % 45)}%` }} />
          <Skeleton className="ml-auto h-5 w-14" />
          <Skeleton className="hidden h-3 w-12 md:block" />
          <Skeleton className="hidden h-5 w-28 lg:block" />
        </div>
      ))}
    </div>
  );
}
