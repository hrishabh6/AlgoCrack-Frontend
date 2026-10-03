"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TagCount } from "@/types";

interface TopicChipsProps {
  /** null while loading. */
  tags: TagCount[] | null;
  selected: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
  /** How many topics to show before "More". */
  collapsedCount?: number;
}

function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        active
          ? "border-primary/50 bg-primary/12 text-primary"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "font-mono text-[10px] tabular-nums",
            active ? "text-primary/80" : "text-subtle-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Topic discovery row. Shows the most used topics (counts from the backend), always keeps
 * selected topics visible, and expands to every topic on demand.
 */
export function TopicChips({ tags, selected, onToggle, onClear, collapsedCount = 8 }: TopicChipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (tags === null) {
    return (
      <div className="flex gap-2 overflow-hidden" aria-busy="true" aria-label="Loading topics">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-7 shrink-0 rounded-full" style={{ width: `${64 + ((i * 29) % 48)}px` }} />
        ))}
      </div>
    );
  }

  const populated = tags.filter((t) => t.problemCount > 0 || selected.includes(t.name));
  if (populated.length === 0) return null;

  const top = populated.slice(0, collapsedCount);
  const hiddenSelected = populated.slice(collapsedCount).filter((t) => selected.includes(t.name));
  const visible = expanded ? populated : [...top, ...hiddenSelected];
  const hiddenCount = populated.length - visible.length;
  const canExpand = populated.length > collapsedCount;

  return (
    <div role="group" aria-label="Filter by topic">
      <div
        className={cn(
          "flex gap-2",
          expanded
            ? "flex-wrap"
            : "-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
        )}
      >
        <Chip active={selected.length === 0} onClick={onClear}>
          All topics
        </Chip>
        {visible.map((tag) => (
          <Chip
            key={tag.id}
            active={selected.includes(tag.name)}
            onClick={() => onToggle(tag.name)}
            count={tag.problemCount}
          >
            {tag.name}
          </Chip>
        ))}
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {expanded ? (
              <>
                Less <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                {hiddenCount > 0 ? `${hiddenCount} more` : "More"} <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
