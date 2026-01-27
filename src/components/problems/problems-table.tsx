"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionSummary } from "@/types";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProblemsTableProps {
  questions: QuestionSummary[];
}

export function ProblemsTable({ questions }: ProblemsTableProps) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <span className="text-xl">?</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold">No problems found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          No problems match your current filters. Try adjusting them.
        </p>
        <Button variant="outline" asChild>
          <Link href="/problems">Clear Filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Difficulty</TableHead>
            <TableHead className="hidden md:table-cell">Acceptance</TableHead>
            <TableHead className="hidden md:table-cell">Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                {/* TODO: Check user submission status if logged in */}
                <div className="h-4 w-4 rounded-full border-2 border-muted" />
              </TableCell>
              <TableCell>
                <Link
                  href={`/problems/${question.id}`}
                  className="font-medium hover:underline hover:text-primary transition-colors block py-2"
                >
                  {question.id}. {question.questionTitle}
                </Link>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    DIFFICULTY_COLORS[question.difficultyLevel] || "text-muted-foreground"
                  )}
                >
                  {question.difficultyLevel}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {question.acceptanceRate
                  ? `${question.acceptanceRate.toFixed(1)}%`
                  : "-"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {question.tags && question.tags.length > 0 ? (
                    question.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                  {question.tags && question.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{question.tags.length - 3}
                    </Badge>
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
