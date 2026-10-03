"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Library, ListChecks, PanelLeftOpen, Plus, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListDialogStore } from "@/store/useListDialogStore";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";

export type LibrarySection = { kind: "all" } | { kind: "saved" } | { kind: "list"; id: number };

export function listPath(listId: number | "saved") {
  return `/problems/lists/${listId}`;
}

function NavItem({
  href,
  icon,
  label,
  count,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        active
          ? "bg-accent font-semibold text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <span className={cn("shrink-0 [&_svg]:size-4", active ? "text-primary" : "text-subtle-foreground")}>{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="font-mono text-[11px] tabular-nums text-subtle-foreground">{count}</span>
      )}
    </Link>
  );
}

function LibraryNav({ active, onNavigate }: { active: LibrarySection; onNavigate?: () => void }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const status = useProblemLibraryStore((s) => s.status);
  const savedCount = useProblemLibraryStore((s) => s.savedIds.length);
  const lists = useProblemLibraryStore((s) => s.lists);
  const load = useProblemLibraryStore((s) => s.load);
  const openCreate = useListDialogStore((s) => s.openCreate);

  const ready = isAuthenticated && status === "ready";

  return (
    <nav aria-label="Problem library" className="space-y-4">
      <div className="space-y-0.5">
        <NavItem
          href="/problems"
          icon={<Library />}
          label="Library"
          active={active.kind === "all"}
          onNavigate={onNavigate}
        />
        <NavItem
          href={listPath("saved")}
          icon={<Bookmark />}
          label="Saved"
          count={ready ? savedCount : undefined}
          active={active.kind === "saved"}
          onNavigate={onNavigate}
        />
      </div>

      <div className="space-y-1.5 border-t pt-4">
        <div className="flex items-center justify-between px-2.5">
          <h2 className="text-xs font-semibold text-muted-foreground">My Lists</h2>
          {ready && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                onNavigate?.();
                openCreate();
              }}
              aria-label="Create a new list"
              title="New list"
            >
              <Plus />
            </Button>
          )}
        </div>

        {authLoading || (isAuthenticated && (status === "idle" || status === "loading")) ? (
          <div className="space-y-1.5 px-2 pt-1" aria-busy="true">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !isAuthenticated ? (
          <div className="mx-0.5 space-y-2 rounded-lg border border-dashed p-3">
            <p className="text-xs text-muted-foreground">
              Sign in to save problems and group them into lists for revision.
            </p>
            <Button variant="outline" size="xs" asChild>
              <Link href={`/auth/signin?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
            </Button>
          </div>
        ) : status === "error" ? (
          <div className="mx-0.5 space-y-2 rounded-lg border border-dashed p-3">
            <p className="text-xs text-muted-foreground">Couldn&apos;t load your lists.</p>
            <Button variant="outline" size="xs" onClick={() => void load({ force: true })}>
              <RotateCcw />
              Retry
            </Button>
          </div>
        ) : lists.length === 0 ? (
          <div className="mx-0.5 space-y-2 rounded-lg border border-dashed p-3">
            <p className="text-xs text-muted-foreground">
              No lists yet. Make one for a topic drill, revision set or an upcoming interview.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                onNavigate?.();
                openCreate();
              }}
            >
              <Plus />
              New list
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {lists.map((list) => (
              <NavItem
                key={list.id}
                href={listPath(list.id)}
                icon={<ListChecks />}
                label={list.name}
                count={list.problemCount}
                active={active.kind === "list" && active.id === list.id}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * Three-column problem workspace: library sidebar pinned to the left edge, centered content and an
 * optional right rail. Below lg the library moves into a slide-in sheet; the rail shows from xl.
 */
export function LibraryLayout({
  active,
  rail,
  children,
}: {
  active: LibrarySection;
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div
      className={cn(
        "min-h-[calc(100dvh-3rem)] lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]",
        rail && "xl:grid-cols-[15rem_minmax(0,1fr)_19rem] 2xl:grid-cols-[16rem_minmax(0,1fr)_21rem]"
      )}
    >
      <aside className="hidden border-r lg:block">
        <div className="sticky top-12 h-[calc(100dvh-3rem)] overflow-y-auto px-3 py-4">
          <LibraryNav active={active} />
        </div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto w-full max-w-[66rem]">
          <div className="mb-4 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => setSheetOpen(true)}
              aria-label="Open library"
            >
              <PanelLeftOpen />
              Library
            </Button>
          </div>
          {children}
        </div>
      </main>

      {rail && (
        <aside className="hidden xl:block" aria-label="Your progress">
          <div className="sticky top-12 h-[calc(100dvh-3rem)] space-y-3 overflow-y-auto py-6 pr-4 2xl:pr-6">
            {rail}
          </div>
        </aside>
      )}

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen} title="Library" variant="sheet-left">
        <LibraryNav active={active} onNavigate={() => setSheetOpen(false)} />
      </Dialog>
    </div>
  );
}
