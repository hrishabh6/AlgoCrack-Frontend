"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, LayoutList, Library, ListChecks, PanelLeftClose, PanelLeftOpen, Plus, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useListDialogStore } from "@/store/useListDialogStore";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";

export type LibrarySection = { kind: "all" } | { kind: "saved" } | { kind: "list"; id: number };

const COLLAPSE_KEY = "algocrack.problems.library-collapsed";
const collapseListeners = new Set<() => void>();

function subscribeCollapsed(onChange: () => void) {
  collapseListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    collapseListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Sidebar visibility is a per-device UI preference, so localStorage is the right home for it. */
function toggleCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, value ? "1" : "0");
  } catch {
    // Storage unavailable (private mode); the preference just won't persist.
  }
  collapseListeners.forEach((listener) => listener());
}

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
        "group flex h-8 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        active
          ? "bg-selected font-medium text-selected-foreground"
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
    <nav aria-label="Problem library" className="space-y-5">
      <div className="space-y-0.5">
        <NavItem
          href="/problems"
          icon={<LayoutList />}
          label="All problems"
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">My lists</h2>
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
 * Page frame for the problem browser and list views: a collapsible library sidebar on desktop
 * and a slide-in sheet on smaller screens.
 */
export function LibraryLayout({ active, children }: { active: LibrarySection; children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className={cn("lg:grid lg:gap-8", collapsed ? "lg:grid-cols-1" : "lg:grid-cols-[13rem_minmax(0,1fr)]")}>
      {!collapsed && (
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100dvh-5rem)] overflow-y-auto pb-4">
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Library className="size-4 text-primary" />
                Library
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => toggleCollapsed(true)}
                aria-label="Hide library sidebar"
                title="Hide sidebar"
              >
                <PanelLeftClose />
              </Button>
            </div>
            <LibraryNav active={active} />
          </div>
        </aside>
      )}

      <div className="min-w-0">
        <div className={cn("mb-4 flex", collapsed ? "lg:flex" : "lg:hidden")}>
          <Button
            variant="outline"
            size="sm"
            className="border-border"
            onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? toggleCollapsed(false) : setSheetOpen(true))}
            aria-label="Open library"
          >
            <PanelLeftOpen />
            Library
          </Button>
        </div>
        {children}
      </div>

      <Dialog open={sheetOpen} onOpenChange={setSheetOpen} title="Library" variant="sheet-left">
        <LibraryNav active={active} onNavigate={() => setSheetOpen(false)} />
      </Dialog>
    </div>
  );
}
