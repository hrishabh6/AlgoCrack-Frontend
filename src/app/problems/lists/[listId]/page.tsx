"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bookmark, FolderX, ListChecks, ListX, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProblemList, getSavedProblems } from "@/lib/api/problem-lists-service";
import { LibraryLayout, type LibrarySection } from "@/components/problems/library-sidebar";
import { ProblemsTable, ProblemsTableSkeleton } from "@/components/problems/problems-table";
import { DIFFICULTY_TEXT, EmptyState, PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeUnknownError } from "@/lib/error-utils";
import { useListDialogStore } from "@/store/useListDialogStore";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";
import type { Difficulty, ProblemListDetail } from "@/types";

type ListRef = "saved" | number;

interface DetailResult {
  key: string;
  detail: ProblemListDetail | null;
  error: string | null;
  notFound: boolean;
}

function parseListRef(raw: string | string[] | undefined): ListRef | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "saved") return "saved";
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

function PageFrame({ active, children }: { active: LibrarySection; children: React.ReactNode }) {
  return (
    <LibraryLayout active={active}>{children}</LibraryLayout>
  );
}

export default function ProblemListPage() {
  const params = useParams<{ listId: string }>();
  const router = useRouter();
  const listRef = parseListRef(params.listId);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const libraryStatus = useProblemLibraryStore((s) => s.status);
  const savedIds = useProblemLibraryStore((s) => s.savedIds);
  const lists = useProblemLibraryStore((s) => s.lists);
  const solvedIdList = useProblemLibraryStore((s) => s.solvedIds);
  const openRename = useListDialogStore((s) => s.openRename);
  const openDelete = useListDialogStore((s) => s.openDelete);

  const [result, setResult] = useState<DetailResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${listRef}#${reloadKey}`;
  const canFetch = listRef !== null && isAuthenticated && !authLoading;
  const isLoading = canFetch && result?.key !== requestKey;

  useEffect(() => {
    if (!canFetch || listRef === null) return;
    let cancelled = false;
    (listRef === "saved" ? getSavedProblems() : getProblemList(listRef))
      .then((detail) => {
        if (!cancelled) setResult({ key: requestKey, detail, error: null, notFound: false });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = normalizeUnknownError(err, "Something went wrong.").message;
        setResult({ key: requestKey, detail: null, error: message, notFound: /not found/i.test(message) });
      });
    return () => {
      cancelled = true;
    };
  }, [canFetch, listRef, requestKey]);

  const storeReady = isAuthenticated && libraryStatus === "ready";
  const storeList = typeof listRef === "number" ? lists.find((l) => l.id === listRef) : undefined;
  const memberIds = listRef === "saved" ? savedIds : storeList?.problemIds;
  const detail = result?.key === requestKey ? result.detail : null;

  // The store is the live source of membership: unchecking a list in a row's menu removes the row here.
  const problems = useMemo(() => {
    if (!detail) return [];
    if (!storeReady || !memberIds) return detail.problems;
    const live = new Set(memberIds);
    return detail.problems.filter((p) => live.has(p.id));
  }, [detail, storeReady, memberIds]);

  const solvedIds = useMemo(() => (storeReady ? new Set(solvedIdList) : undefined), [storeReady, solvedIdList]);

  const breakdown = useMemo(() => {
    const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach((p) => {
      if (p.difficultyLevel in counts) counts[p.difficultyLevel] += 1;
    });
    return counts;
  }, [problems]);

  const active: LibrarySection =
    listRef === "saved" ? { kind: "saved" } : typeof listRef === "number" ? { kind: "list", id: listRef } : { kind: "all" };

  if (listRef === null) {
    return (
      <PageFrame active={active}>
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon={<FolderX />}
            title="List not found"
            description="This link doesn't point to a valid list."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/problems">Back to problems</Link>
              </Button>
            }
          />
        </div>
      </PageFrame>
    );
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <PageFrame active={active}>
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon={<Bookmark />}
            title="Sign in to see your lists"
            description="Saved problems and lists belong to your account."
            action={
              <Button size="sm" asChild>
                <Link href={`/auth/signin?next=${encodeURIComponent(`/problems/lists/${listRef}`)}`}>Sign in</Link>
              </Button>
            }
          />
        </div>
      </PageFrame>
    );
  }

  if (authLoading || isLoading) {
    return (
      <PageFrame active={active}>
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="mt-6">
          <ProblemsTableSkeleton rows={6} />
        </div>
      </PageFrame>
    );
  }

  if (!detail) {
    const notFound = result?.notFound ?? false;
    return (
      <PageFrame active={active}>
        <div className="rounded-lg border bg-card">
          <EmptyState
            tone={notFound ? "default" : "error"}
            icon={notFound ? <FolderX /> : undefined}
            title={notFound ? "List not found" : "Couldn't load this list"}
            description={
              notFound ? "It may have been deleted, or it belongs to another account." : (result?.error ?? undefined)
            }
            action={
              notFound ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/problems">Back to problems</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
                  <RotateCcw />
                  Try again
                </Button>
              )
            }
          />
        </div>
      </PageFrame>
    );
  }

  const name = storeList?.name ?? detail.name;
  const description = storeList ? storeList.description : detail.description;
  const count = storeReady && memberIds ? memberIds.length : detail.problemCount;
  const updated = formatDate(storeList?.updatedAt ?? detail.updatedAt);
  const solvedHere = solvedIds ? problems.filter((p) => solvedIds.has(p.id)).length : null;

  return (
    <PageFrame active={active}>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {detail.builtIn ? (
              <Bookmark className="size-5 text-primary" />
            ) : (
              <ListChecks className="size-5 text-primary" />
            )}
            <span className="min-w-0 break-words">{name}</span>
          </span>
        }
        meta={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums">
            <span>
              {count} {count === 1 ? "problem" : "problems"}
            </span>
            {solvedHere !== null && count > 0 && <span className="text-success">{solvedHere} solved</span>}
            {updated && <span className="text-subtle-foreground">Updated {updated}</span>}
          </span>
        }
        description={
          description ||
          (detail.builtIn ? "Problems you bookmarked to come back to." : undefined)
        }
        actions={
          storeList ? (
            <>
              <Button variant="outline" size="sm" className="border-border" onClick={() => openRename(storeList)}>
                <Pencil />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => openDelete(storeList, () => router.push("/problems"))}
              >
                <Trash2 />
                Delete
              </Button>
            </>
          ) : undefined
        }
      />

      {problems.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {(Object.keys(breakdown) as Difficulty[]).map((d) => (
            <span key={d} className="flex items-center gap-1.5">
              <span className={DIFFICULTY_TEXT[d]}>{d}</span>
              <span className="font-mono tabular-nums text-foreground">{breakdown[d]}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ProblemsTable
          questions={problems}
          solvedIds={solvedIds}
          emptyState={
            <EmptyState
              icon={<ListX />}
              title="This list doesn't contain any problems yet."
              description={
                detail.builtIn
                  ? "Use the bookmark on any problem to save it here."
                  : "Use the bookmark on any problem to add it to this list."
              }
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/problems">Browse problems</Link>
                </Button>
              }
            />
          }
        />
      </div>
    </PageFrame>
  );
}
