"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { normalizeUnknownError } from "@/lib/error-utils";
import type { LeaderboardResponse } from "@/types/progress";
import { Button } from "@/components/ui/button";
import { EmptyState, PageContainer } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<LeaderboardResponse>(
        `${ENDPOINTS.LEADERBOARD}?page=${pageIndex}&size=25`
      );
      setData(res);
      setPage(pageIndex);
    } catch (err) {
      setError(normalizeUnknownError(err, "Failed to load leaderboard").message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    load(0);
  }, [authLoading, isAuthenticated, load]);

  if (authLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-64 w-full" />
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <EmptyState
          icon={<LogIn />}
          title="Sign in to view the leaderboard"
          action={
            <Button asChild size="sm">
              <Link href={`/auth/signin?next=${encodeURIComponent("/leaderboard")}`}>
                Sign in
              </Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <header className="flex items-center gap-3">
        <Trophy className="size-8 text-warning" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Global all-time AlgoCrack Score</p>
        </div>
      </header>

      {error && (
        <EmptyState tone="error" title="Could not load leaderboard" description={error} />
      )}

      {loading && !data && <Skeleton className="h-80 w-full rounded-lg" />}

      {data && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                  <th className="px-4 py-3 font-medium text-right">Solved</th>
                  <th className="px-4 py-3 font-medium text-right">POTD</th>
                </tr>
              </thead>
              <tbody>
                {data.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No ranked users yet.
                    </td>
                  </tr>
                ) : (
                  data.content.map((row) => (
                    <tr
                      key={`${row.position}-${row.userId}`}
                      className={cn(
                        "border-b last:border-0",
                        row.currentUser && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3 font-mono tabular-nums">{row.position}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium">
                        {row.userId}
                        {row.currentUser && (
                          <span className="ml-2 text-xs text-primary">(you)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{row.tierCode}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {row.totalScore.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{row.uniqueSolved}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.totalPotdCompleted}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Page {data.page + 1} of {Math.max(1, data.totalPages)} · {data.totalElements}{" "}
              ranked
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 0 || loading}
                onClick={() => load(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= data.totalPages || loading}
                onClick={() => load(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
