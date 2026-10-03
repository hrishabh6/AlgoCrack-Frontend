"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, CircleCheck, Filter, Gauge, Lock, Minus, RotateCcw, Search, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Difficulty, SolveStatusFilter, TagCount } from "@/types";
import type { FilterOp, ProblemFilterState } from "./use-problem-filters";

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  Easy: "bg-success",
  Medium: "bg-warning",
  Hard: "bg-destructive",
};

function OperatorSelect({
  value,
  onChange,
  disabled,
  label,
}: {
  value: FilterOp;
  onChange: (op: FilterOp) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as FilterOp)} disabled={disabled}>
      <SelectTrigger size="sm" className={cn(fieldClass, "gap-1 px-2")} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="text-[13px]">
        <SelectItem value="is">is</SelectItem>
        <SelectItem value="is-not">is not</SelectItem>
      </SelectContent>
    </Select>
  );
}

/** Radix select / menu popups render in a portal outside the panel. */
const RADIX_POPUP = "[data-radix-popper-content-wrapper]";

const fieldClass =
  "h-8 w-full min-w-0 rounded-md border border-border bg-background/60 px-2.5 text-[13px] shadow-none hover:bg-accent/50";

interface FilterPanelProps {
  filters: ProblemFilterState;
  onChange: (patch: Partial<ProblemFilterState>) => void;
  onToggleTag: (tag: string) => void;
  onReset: () => void;
  tags: TagCount[] | null;
  /** Solve-status filtering needs a signed-in user; the row is shown locked otherwise. */
  showStatus: boolean;
  triggerClassName?: string;
}

function FilterRow({
  icon: Icon,
  label,
  active,
  locked,
  onClear,
  operator,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  locked?: boolean;
  onClear: () => void;
  /** Operator control; defaults to a fixed "is". */
  operator?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[5.25rem_4.5rem_minmax(0,1fr)_1.75rem] items-center gap-2 sm:grid-cols-[7.5rem_5rem_minmax(0,1fr)_1.75rem]">
      <span
        className={cn(
          "flex items-center gap-2 text-[13px]",
          active ? "text-foreground" : "text-muted-foreground",
          locked && "opacity-60"
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-subtle-foreground")} />
        {label}
      </span>
      {operator ?? (
        <span
          className={cn(
            fieldClass,
            "flex items-center text-muted-foreground hover:bg-background/60",
            locked && "opacity-50"
          )}
        >
          is
        </span>
      )}
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 text-subtle-foreground hover:text-foreground disabled:opacity-30"
        onClick={onClear}
        disabled={!active}
        aria-label={`Clear ${label.toLowerCase()} filter`}
      >
        <Minus className="size-4" />
      </Button>
    </div>
  );
}

function TopicsField({
  tags,
  selected,
  onToggle,
}: {
  tags: TagCount[] | null;
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  const [query, setQuery] = useState("");
  const options = useMemo(() => {
    const visible = (tags ?? []).filter((t) => t.problemCount > 0 || selected.includes(t.name));
    const q = query.trim().toLowerCase();
    return q ? visible.filter((t) => t.name.toLowerCase().includes(q)) : visible;
  }, [tags, selected, query]);

  return (
    <DropdownMenu modal={false} onOpenChange={(open) => !open && setQuery("")}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(fieldClass, "flex items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/25")}
          aria-label="Topics"
        >
          {selected.length === 0 ? (
            <span className="flex-1 truncate text-muted-foreground">Any topic</span>
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-1">
              <span className="truncate rounded bg-accent px-1.5 py-px text-xs text-foreground">{selected[0]}</span>
              {selected.length > 1 && (
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">+{selected.length - 1}</span>
              )}
            </span>
          )}
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56 p-0">
        <div className="relative border-b border-border">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search topics"
            aria-label="Search topics"
            className="h-9 w-full bg-transparent pl-8 pr-3 text-[13px] outline-none placeholder:text-subtle-foreground"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {tags === null ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">Loading topics…</p>
          ) : options.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">No matching topics</p>
          ) : (
            options.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selected.includes(tag.name)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => onToggle(tag.name)}
                className="text-[13px]"
              >
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="font-mono text-[10px] tabular-nums text-subtle-foreground">{tag.problemCount}</span>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** LeetCode-style filter builder. Every row has is / is not; Match All ANDs the rows. */
export function FilterPanel({
  filters,
  onChange,
  onToggleTag,
  onReset,
  tags,
  showStatus,
  triggerClassName,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeCount = (filters.difficulty ? 1 : 0) + (showStatus && filters.status ? 1 : 0) + filters.tags.length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      // While a modal Radix popup is open the body ignores pointer events, so this lands on <html>;
      // that press only dismisses the popup.
      if (target.closest?.(RADIX_POPUP) || document.querySelector(RADIX_POPUP)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector(RADIX_POPUP)) return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        className={cn(triggerClassName, "relative", (open || activeCount > 0) && "border-primary/50 text-primary")}
        aria-label={activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Filter"
        onClick={() => setOpen((v) => !v)}
      >
        <Filter className="size-4" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Filter problems"
          className="absolute left-0 top-full z-40 mt-2 w-full rounded-xl border border-border bg-popover p-3 shadow-2xl shadow-black/40 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 sm:w-[34rem]"
        >
          <div className="rounded-lg border border-border/70 bg-surface/70 p-3">
            <p className="mb-3 flex items-center gap-2 text-[13px] text-muted-foreground">
              Match
              <span className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-xs font-medium text-foreground">
                All
              </span>
              of the following filters:
            </p>

            <div className="space-y-2">
              <FilterRow
                icon={showStatus ? CircleCheck : Lock}
                label="Status"
                active={showStatus && filters.status !== null}
                locked={!showStatus}
                onClear={() => onChange({ status: null, statusOp: "is" })}
                operator={
                  <OperatorSelect
                    value={filters.statusOp}
                    onChange={(statusOp) => onChange({ statusOp })}
                    disabled={!showStatus}
                    label="Status operator"
                  />
                }
              >
                <Select
                  value={showStatus ? (filters.status ?? "any") : "any"}
                  onValueChange={(v) => onChange({ status: v === "any" ? null : (v as SolveStatusFilter), ...(v === "any" ? { statusOp: "is" } : {}) })}
                  disabled={!showStatus}
                >
                  <SelectTrigger size="sm" className={fieldClass} aria-label="Status" title={showStatus ? undefined : "Sign in to filter by status"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="text-[13px]">
                    <SelectItem value="any">{showStatus ? "Any status" : "Sign in to use"}</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                    <SelectItem value="unsolved">Unsolved</SelectItem>
                  </SelectContent>
                </Select>
              </FilterRow>

              <FilterRow
                icon={Gauge}
                label="Difficulty"
                active={filters.difficulty !== null}
                onClear={() => onChange({ difficulty: null, difficultyOp: "is" })}
                operator={
                  <OperatorSelect
                    value={filters.difficultyOp}
                    onChange={(difficultyOp) => onChange({ difficultyOp })}
                    label="Difficulty operator"
                  />
                }
              >
                <Select
                  value={filters.difficulty ?? "any"}
                  onValueChange={(v) =>
                    onChange({ difficulty: v === "any" ? null : (v as Difficulty), ...(v === "any" ? { difficultyOp: "is" } : {}) })
                  }
                >
                  <SelectTrigger size="sm" className={fieldClass} aria-label="Difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="any">Any difficulty</SelectItem>
                    {(Object.keys(DIFFICULTY_DOT) as Difficulty[]).map((d) => (
                      <SelectItem key={d} value={d}>
                        <span className={cn("size-1.5 rounded-full", DIFFICULTY_DOT[d])} aria-hidden="true" />
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterRow>

              <FilterRow
                icon={Tags}
                label="Topics"
                active={filters.tags.length > 0}
                onClear={() => onChange({ tags: [], tagsOp: "is" })}
                operator={
                  <OperatorSelect
                    value={filters.tagsOp}
                    onChange={(tagsOp) => onChange({ tagsOp })}
                    label="Topics operator"
                  />
                }
              >
                <TopicsField tags={tags} selected={filters.tags} onToggle={onToggleTag} />
              </FilterRow>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <p className="flex-1 text-xs text-subtle-foreground">Filters apply instantly.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 px-4"
              onClick={onReset}
              disabled={activeCount === 0 && !filters.search}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
