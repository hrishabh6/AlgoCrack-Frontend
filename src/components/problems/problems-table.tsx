"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { problemPath } from "@/lib/slug-utils";
import type { Difficulty, QuestionSummary } from "@/types";
import { SaveProblemMenu } from "./save-problem-menu";

interface ProblemsTableProps {
  questions: QuestionSummary[];
  /** Ids the signed-in user has solved; omit to hide the status column. */
  solvedIds?: ReadonlySet<number>;
  /** Rendered instead of the list when there are no rows. */
  emptyState: React.ReactNode;
}

const DIFFICULTY_LABEL: Record<Difficulty, { label: string; className: string }> = {
  Easy: { label: "Easy", className: "text-success" },
  Medium: { label: "Med.", className: "text-warning" },
  Hard: { label: "Hard", className: "text-destructive" },
};

/** Acceptance is only meaningful once a problem has evaluated submissions. */
export function formatAcceptance(question: QuestionSummary): string | null {
  if (!question.totalSubmissions || question.acceptanceRate === null || question.acceptanceRate === undefined) {
    return null;
  }
  return `${question.acceptanceRate.toFixed(1)}%`;
}

const cell = "py-2.5 transition-colors first:rounded-l-lg last:rounded-r-lg group-odd:bg-surface group-hover:bg-accent/70";

export function ProblemsTable({ questions, solvedIds, emptyState }: ProblemsTableProps) {
  if (questions.length === 0) {
    return <div className="rounded-lg border bg-card animate-in fade-in-50">{emptyState}</div>;
  }

  const showStatus = solvedIds !== undefined;

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead className="sr-only">
        <tr>
          {showStatus && <th scope="col">Status</th>}
          <th scope="col">Title</th>
          <th scope="col">Acceptance</th>
          <th scope="col">Difficulty</th>
          <th scope="col">Save</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((question) => {
          const solved = solvedIds?.has(question.id) ?? false;
          const acceptance = formatAcceptance(question);
          const difficulty = DIFFICULTY_LABEL[question.difficultyLevel] ?? {
            label: question.difficultyLevel,
            className: "text-muted-foreground",
          };
          return (
            <tr key={question.id} className="group">
              {showStatus && (
                <td className={cn(cell, "w-10 min-w-10 pl-3")}>
                  {solved ? (
                    <CheckCircle2 className="size-4 text-success" aria-label="Solved" />
                  ) : (
                    <span className="sr-only">Not solved</span>
                  )}
                </td>
              )}
              <td className={cn(cell, "w-full max-w-0 pr-3", !showStatus && "pl-4")}>
                <Link
                  href={problemPath(question.questionTitle, question.id)}
                  className="block truncate text-[13.5px] font-medium text-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
                >
                  {question.id}. {question.questionTitle}
                </Link>
              </td>
              <td className={cn(cell, "hidden whitespace-nowrap pr-6 text-right font-mono text-xs tabular-nums text-muted-foreground sm:table-cell")}>
                {acceptance ?? (
                  <span className="text-subtle-foreground" title="No submissions yet">
                    —
                  </span>
                )}
              </td>
              <td className={cn(cell, "min-w-16 whitespace-nowrap pr-2 text-[13px] font-medium sm:min-w-20", difficulty.className)}>{difficulty.label}</td>
              <td className={cn(cell, "pr-2 text-right")}>
                <SaveProblemMenu problemId={question.id} problemTitle={question.questionTitle} revealOnHover />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ProblemsTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading problems">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn("flex h-11 items-center gap-4 rounded-lg px-4", i % 2 === 0 && "bg-surface")}>
          <Skeleton className="h-3.5 flex-1" style={{ maxWidth: `${35 + ((i * 37) % 40)}%` }} />
          <Skeleton className="ml-auto hidden h-3 w-12 sm:block" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="size-4" />
        </div>
      ))}
    </div>
  );
}
