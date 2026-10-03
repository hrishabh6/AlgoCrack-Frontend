"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, ListPlus, Loader2, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useListDialogStore } from "@/store/useListDialogStore";
import { useProblemLibraryStore } from "@/store/useProblemLibraryStore";

interface SaveProblemMenuProps {
  problemId: number;
  problemTitle: string;
  className?: string;
  /** On hover-capable layouts, hide the button until its row is hovered unless the problem is saved. */
  revealOnHover?: boolean;
}

/** Bookmark button that toggles Saved and custom-list membership for one problem. */
export function SaveProblemMenu({ problemId, problemTitle, className, revealOnHover }: SaveProblemMenuProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = useProblemLibraryStore((s) => s.status);
  const isSaved = useProblemLibraryStore((s) => s.savedIds.includes(problemId));
  const lists = useProblemLibraryStore((s) => s.lists);
  const pending = useProblemLibraryStore((s) => s.pending);
  const toggleSaved = useProblemLibraryStore((s) => s.toggleSaved);
  const toggleInList = useProblemLibraryStore((s) => s.toggleInList);
  const load = useProblemLibraryStore((s) => s.load);
  const openCreate = useListDialogStore((s) => s.openCreate);

  const memberOf = lists.filter((l) => l.problemIds.includes(problemId));
  const isMarked = isSaved || memberOf.length > 0;
  const summary = [isSaved && "Saved", memberOf.length > 0 && `${memberOf.length} ${memberOf.length === 1 ? "list" : "lists"}`]
    .filter(Boolean)
    .join(" · ");

  const qs = searchParams.toString();
  const signInHref = `/auth/signin?next=${encodeURIComponent(qs ? `${pathname}?${qs}` : pathname)}`;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-7",
            isMarked && "text-primary hover:text-primary",
            revealOnHover &&
              !isMarked &&
              "md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:data-[state=open]:opacity-100",
            className
          )}
          aria-label={isMarked ? `Saved: ${summary}. Edit lists for ${problemTitle}` : `Save ${problemTitle}`}
          title={isMarked ? summary : "Save to a list"}
        >
          <Bookmark className={cn("size-4", isMarked && "fill-current")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {!isAuthenticated ? (
          <div className="space-y-2 p-2">
            <p className="text-sm font-medium text-foreground">Keep track of problems</p>
            <p className="text-xs text-muted-foreground">Sign in to save problems and organize them into lists.</p>
            <Button size="sm" className="w-full" asChild>
              <Link href={signInHref}>Sign in</Link>
            </Button>
          </div>
        ) : status === "error" ? (
          <div className="space-y-2 p-2">
            <p className="text-xs text-muted-foreground">Couldn&apos;t load your lists.</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => void load({ force: true })}>
              <RotateCcw />
              Retry
            </Button>
          </div>
        ) : status !== "ready" ? (
          <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Loading your lists…
          </div>
        ) : (
          <>
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
              Save “{problemTitle}”
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={isSaved}
              disabled={Boolean(pending[`saved:${problemId}`])}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => void toggleSaved(problemId)}
            >
              <span className="flex-1">Saved</span>
              <Bookmark className="size-3.5 text-subtle-foreground" />
            </DropdownMenuCheckboxItem>
            {lists.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="max-h-56 overflow-y-auto">
                  {lists.map((list) => (
                    <DropdownMenuCheckboxItem
                      key={list.id}
                      checked={list.problemIds.includes(problemId)}
                      disabled={Boolean(pending[`${list.id}:${problemId}`])}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={() => void toggleInList(list.id, problemId)}
                    >
                      <span className="flex-1 truncate">{list.name}</span>
                      <span className="font-mono text-[10px] tabular-nums text-subtle-foreground">
                        {list.problemCount}
                      </span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => openCreate(problemId)}>
              <ListPlus />
              Create new list
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
