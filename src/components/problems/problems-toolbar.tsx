"use client";

import { useEffect, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, Check, Search, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProblemSortKey, TagCount } from "@/types";
import { FilterPanel } from "./filter-panel";
import { hasActiveFilters, type ProblemFilterState } from "./use-problem-filters";

const SEARCH_DEBOUNCE_MS = 350;

const SORT_LABEL: Record<ProblemSortKey, string> = {
  id: "Number",
  title: "Title",
  difficulty: "Difficulty",
};

interface ProblemsToolbarProps {
  filters: ProblemFilterState;
  onChange: (patch: Partial<ProblemFilterState>, options?: { replace?: boolean }) => void;
  onToggleTag: (tag: string) => void;
  onReset: () => void;
  tags: TagCount[] | null;
  /** Solve-status filtering needs a signed-in user. */
  showStatus: boolean;
  /** Solved / total problems for the signed-in user; omit to hide the progress ring. */
  progress?: { solved: number; total: number } | null;
  /** Opens a random problem from the current results; omit to hide the button. */
  onRandom?: () => void;
}

const iconButton =
  "size-8 rounded-full border border-border bg-surface text-muted-foreground hover:bg-accent hover:text-foreground";

function SolvedRing({ solved, total }: { solved: number; total: number }) {
  const ratio = total > 0 ? Math.min(1, solved / total) : 0;
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <span className="flex items-center gap-2 text-[13px] text-muted-foreground" title={`${solved} of ${total} solved`}>
      <svg viewBox="0 0 20 20" className="size-5 -rotate-90" aria-hidden="true">
        <circle cx="10" cy="10" r={r} fill="none" strokeWidth="2.5" className="stroke-muted" />
        <circle
          cx="10"
          cy="10"
          r={r}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${ratio * c} ${c}`}
          className="stroke-success"
        />
      </svg>
      <span>
        <span className="font-mono tabular-nums text-foreground">
          {solved}/{total}
        </span>{" "}
        Solved
      </span>
    </span>
  );
}

function ActiveFilter({ label, onRemove }: { label: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-border bg-surface pl-2.5 pr-1 text-xs text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex size-4 items-center justify-center rounded-full text-subtle-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={`Remove filter ${typeof label === "string" ? label : ""}`.trim()}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function ProblemsToolbar({
  filters,
  onChange,
  onToggleTag,
  onReset,
  tags,
  showStatus,
  progress,
  onRandom,
}: ProblemsToolbarProps) {
  const [search, setSearch] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  const [pushedSearch, setPushedSearch] = useState(filters.search);

  // URL changed (reset, back/forward): adopt it unless it is the echo of our own debounced push,
  // which would clobber keystrokes typed since.
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    if (filters.search !== pushedSearch) {
      setSearch(filters.search);
      setPushedSearch(filters.search);
    }
  }

  useEffect(() => {
    const value = search.trim();
    if (value === filters.search) return;
    const timer = setTimeout(() => {
      setPushedSearch(value);
      onChange({ search: value }, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, filters.search, onChange]);

  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-2.5">
      <div className="relative flex items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-60 sm:flex-none">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions"
            aria-label="Search problems"
            className="h-8 w-full rounded-full border border-border bg-surface pl-9 pr-3 text-[13px] text-foreground outline-none transition-[color,box-shadow] placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={iconButton}
              aria-label={`Sort by ${SORT_LABEL[filters.sort]}, ${filters.order === "asc" ? "ascending" : "descending"}`}
              title={`Sort: ${SORT_LABEL[filters.sort]} (${filters.order === "asc" ? "ascending" : "descending"})`}
            >
              <ArrowUpDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={filters.sort} onValueChange={(v) => onChange({ sort: v as ProblemSortKey })}>
              {(Object.keys(SORT_LABEL) as ProblemSortKey[]).map((key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {SORT_LABEL[key]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            {(["asc", "desc"] as const).map((order) => (
              <DropdownMenuItem key={order} onSelect={() => onChange({ order })}>
                {order === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}
                <span className="flex-1">{order === "asc" ? "Ascending" : "Descending"}</span>
                {filters.order === order && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <FilterPanel
          filters={filters}
          onChange={onChange}
          onToggleTag={onToggleTag}
          onReset={onReset}
          tags={tags}
          showStatus={showStatus}
          triggerClassName={iconButton}
        />

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {progress && (
            <span className="hidden sm:inline-flex">
              <SolvedRing solved={progress.solved} total={progress.total} />
            </span>
          )}
          {onRandom && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onRandom}
              aria-label="Pick a random problem"
              title="Pick a random problem"
            >
              <Shuffle className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {active && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.search && (
            <ActiveFilter label={`“${filters.search}”`} onRemove={() => onChange({ search: "" })} />
          )}
          {filters.difficulty && (
            <ActiveFilter
              label={`${filters.difficultyOp === "is-not" ? "not " : ""}${filters.difficulty}`}
              onRemove={() => onChange({ difficulty: null, difficultyOp: "is" })}
            />
          )}
          {filters.status && (
            <ActiveFilter
              label={`${filters.statusOp === "is-not" ? "not " : ""}${filters.status === "solved" ? "Solved" : "Unsolved"}`}
              onRemove={() => onChange({ status: null, statusOp: "is" })}
            />
          )}
          {filters.tags.map((tag) => (
            <ActiveFilter
              key={tag}
              label={`${filters.tagsOp === "is-not" ? "not " : ""}${tag}`}
              onRemove={() => onToggleTag(tag)}
            />
          ))}
          <button
            type="button"
            onClick={onReset}
            className="ml-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
