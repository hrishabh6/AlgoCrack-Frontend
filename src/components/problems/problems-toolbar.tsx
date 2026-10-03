"use client";

import { useEffect, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Check, ChevronDown, X } from "lucide-react";
import { SearchInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Difficulty, ProblemSortKey, SolveStatusFilter, TagCount } from "@/types";
import { hasActiveFilters, type ProblemFilterState } from "./use-problem-filters";

const SEARCH_DEBOUNCE_MS = 350;

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  Easy: "bg-success",
  Medium: "bg-warning",
  Hard: "bg-destructive",
};

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
}

function FilterTrigger({
  label,
  value,
  active,
  ...props
}: { label: string; value?: React.ReactNode; active: boolean } & React.ComponentProps<"button">) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "shrink-0 gap-1.5 border-border font-normal",
        active && "border-primary/40 bg-primary/8 text-foreground"
      )}
      {...props}
    >
      <span className={cn(active ? "text-muted-foreground" : "text-foreground")}>{label}</span>
      {value && <span className="max-w-[9rem] truncate font-medium text-foreground">{value}</span>}
      <ChevronDown className="size-3.5 text-subtle-foreground" />
    </Button>
  );
}

export function ProblemsToolbar({ filters, onChange, onToggleTag, onReset, tags, showStatus }: ProblemsToolbarProps) {
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

  const topicOptions = (tags ?? []).filter((t) => t.problemCount > 0 || filters.tags.includes(t.name));
  const topicValue =
    filters.tags.length === 0 ? undefined : filters.tags.length === 1 ? filters.tags[0] : `${filters.tags.length} selected`;
  const active = hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search by title or number"
        aria-label="Search problems"
        containerClassName="w-full md:max-w-xs"
        className="h-8"
      />

      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FilterTrigger label="Difficulty" value={filters.difficulty ?? undefined} active={!!filters.difficulty} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuRadioGroup
              value={filters.difficulty ?? "all"}
              onValueChange={(v) => onChange({ difficulty: v === "all" ? null : (v as Difficulty) })}
            >
              <DropdownMenuRadioItem value="all">Any difficulty</DropdownMenuRadioItem>
              {(Object.keys(DIFFICULTY_DOT) as Difficulty[]).map((d) => (
                <DropdownMenuRadioItem key={d} value={d}>
                  <span className={cn("size-1.5 rounded-full", DIFFICULTY_DOT[d])} aria-hidden="true" />
                  {d}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FilterTrigger label="Topics" value={topicValue} active={filters.tags.length > 0} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 w-56 overflow-y-auto">
            <DropdownMenuLabel className="flex items-center justify-between text-xs font-normal text-muted-foreground">
              Match all selected
              {filters.tags.length > 0 && (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => onChange({ tags: [] })}
                >
                  Clear
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags === null ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading topics…</div>
            ) : topicOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">No topics yet</div>
            ) : (
              topicOptions.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={filters.tags.includes(tag.name)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => onToggleTag(tag.name)}
                >
                  <span className="flex-1 truncate">{tag.name}</span>
                  <span className="font-mono text-[10px] tabular-nums text-subtle-foreground">{tag.problemCount}</span>
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {showStatus && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <FilterTrigger
                label="Status"
                value={filters.status ? (filters.status === "solved" ? "Solved" : "Unsolved") : undefined}
                active={!!filters.status}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuRadioGroup
                value={filters.status ?? "all"}
                onValueChange={(v) => onChange({ status: v === "all" ? null : (v as SolveStatusFilter) })}
              >
                <DropdownMenuRadioItem value="all">Any status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="solved">Solved</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="unsolved">Unsolved</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" aria-label={`Sort by ${SORT_LABEL[filters.sort]}, ${filters.order === "asc" ? "ascending" : "descending"}`}>
              {filters.order === "asc" ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}
              <span className="text-foreground">{SORT_LABEL[filters.sort]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
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

        {active && (
          <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0">
            <X />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
