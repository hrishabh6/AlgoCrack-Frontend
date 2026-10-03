"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DIFFICULTY_TEXT, DifficultyBadge, TagChip } from "@/components/shared";
import { cn } from "@/lib/utils";
import { problemPath } from "@/lib/slug-utils";
import type { QuestionSummary } from "@/types";
import { SaveProblemMenu } from "./save-problem-menu";

interface ProblemsTableProps {
  questions: QuestionSummary[];
  /** Ids the signed-in user has solved; omit to hide the status column. */
  solvedIds?: ReadonlySet<number>;
  /** Rendered instead of the table when there are no rows. */
  emptyState: React.ReactNode;
  /** Highlights a matching tag chip (e.g. the active topic filters). */
  activeTags?: readonly string[];
}

const MAX_TAGS = 3;

/** Acceptance is only meaningful once a problem has evaluated submissions. */
export function formatAcceptance(question: QuestionSummary): string | null {
  if (!question.totalSubmissions || question.acceptanceRate === null || question.acceptanceRate === undefined) {
    return null;
  }
  return `${question.acceptanceRate.toFixed(1)}%`;
}

function TagList({ tags, activeTags }: { tags: string[]; activeTags?: readonly string[] }) {
  if (!tags || tags.length === 0) return <span className="text-xs text-subtle-foreground">—</span>;
  const ordered = activeTags?.length
    ? [...tags].sort((a, b) => Number(activeTags.includes(b)) - Number(activeTags.includes(a)))
    : tags;
  return (
    <div className="flex items-center gap-1">
      {ordered.slice(0, MAX_TAGS).map((tag) => (
        <TagChip
          key={tag}
          className={cn(
            "max-w-[7.5rem] truncate 2xl:max-w-[10rem]",
            activeTags?.includes(tag) && "border-primary/40 text-primary"
          )}
        >
          {tag}
        </TagChip>
      ))}
      {ordered.length > MAX_TAGS && (
        <TagChip className="bg-transparent" title={ordered.slice(MAX_TAGS).join(", ")}>
          +{ordered.length - MAX_TAGS}
        </TagChip>
      )}
    </div>
  );
}

export function ProblemsTable({ questions, solvedIds, emptyState, activeTags }: ProblemsTableProps) {
  if (questions.length === 0) {
    return <div className="rounded-lg border bg-card animate-in fade-in-50">{emptyState}</div>;
  }

  const showStatus = solvedIds !== undefined;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table className="table-fixed">
        <TableHeader className="bg-surface-2">
          <TableRow className="hover:bg-transparent">
            {showStatus && (
              <TableHead className="w-9 pl-3 pr-0">
                <span className="sr-only">Status</span>
              </TableHead>
            )}
            <TableHead className={cn("w-14", !showStatus && "pl-4")}>#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden w-24 sm:table-cell">Difficulty</TableHead>
            <TableHead className="hidden w-24 text-right md:table-cell xl:w-28 xl:pr-6">Acceptance</TableHead>
            <TableHead className="hidden w-[17rem] xl:table-cell 2xl:w-[23rem]">Topics</TableHead>
            <TableHead className="w-11 pr-2">
              <span className="sr-only">Save</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => {
            const solved = solvedIds?.has(question.id) ?? false;
            const acceptance = formatAcceptance(question);
            return (
              <TableRow key={question.id} className="group">
                {showStatus && (
                  <TableCell className="pl-3 pr-0">
                    {solved ? (
                      <CheckCircle2 className="size-4 text-success" aria-label="Solved" />
                    ) : (
                      <span className="sr-only">Not solved</span>
                    )}
                  </TableCell>
                )}
                <TableCell
                  className={cn("font-mono text-xs tabular-nums text-subtle-foreground", !showStatus && "pl-4")}
                >
                  {question.id}
                </TableCell>
                <TableCell className="min-w-0">
                  <Link
                    href={problemPath(question.questionTitle, question.id)}
                    className="block truncate py-0.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                  >
                    {question.questionTitle}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:hidden">
                    <span className={cn("font-medium", DIFFICULTY_TEXT[question.difficultyLevel])}>
                      {question.difficultyLevel}
                    </span>
                    {acceptance && <span className="font-mono tabular-nums">{acceptance}</span>}
                    {question.tags?.[0] && <span className="truncate">{question.tags[0]}</span>}
                  </div>
                  {question.tags?.length > 0 && (
                    <p className="hidden truncate text-[11px] text-subtle-foreground sm:block xl:hidden">
                      {question.tags.join(" · ")}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <DifficultyBadge difficulty={question.difficultyLevel} />
                </TableCell>
                <TableCell className="hidden text-right font-mono text-xs tabular-nums text-muted-foreground md:table-cell xl:pr-6">
                  {acceptance ?? (
                    <span className="text-subtle-foreground" title="No submissions yet">
                      —
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden overflow-hidden xl:table-cell">
                  <TagList tags={question.tags} activeTags={activeTags} />
                </TableCell>
                <TableCell className="pr-2 text-right">
                  <SaveProblemMenu problemId={question.id} problemTitle={question.questionTitle} />
                </TableCell>
              </TableRow>
            );
          })}
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
          <Skeleton className="ml-auto hidden h-5 w-14 sm:block" />
          <Skeleton className="hidden h-3 w-12 md:block" />
          <Skeleton className="hidden h-5 w-28 xl:block" />
          <Skeleton className="size-5 sm:ml-0 ml-auto" />
        </div>
      ))}
    </div>
  );
}
