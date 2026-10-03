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
}

/**
 * Topic discovery row: every topic with its real problem count on one line, expandable to all
 * topics. Selected topics are highlighted and always listed first so they stay visible.
 */
export function TopicChips({ tags, selected, onToggle }: TopicChipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (tags === null) {
    return (
      <div className="flex h-6 items-center gap-5 overflow-hidden" aria-busy="true" aria-label="Loading topics">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 shrink-0" style={{ width: `${48 + ((i * 29) % 40)}px` }} />
        ))}
      </div>
    );
  }

  const populated = tags.filter((t) => t.problemCount > 0 || selected.includes(t.name));
  if (populated.length === 0) return null;

  const ordered = [
    ...populated.filter((t) => selected.includes(t.name)),
    ...populated.filter((t) => !selected.includes(t.name)),
  ];

  return (
    <div role="group" aria-label="Filter by topic" className="flex items-start gap-3">
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2",
          !expanded && "h-6 overflow-hidden"
        )}
      >
        {ordered.map((tag) => {
          const active = selected.includes(tag.name);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.name)}
              aria-pressed={active}
              className={cn(
                "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded text-[13px] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                active ? "font-medium text-primary" : "text-foreground/85 hover:text-primary"
              )}
            >
              {tag.name}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  active ? "bg-primary/15 text-primary" : "bg-muted text-subtle-foreground"
                )}
              >
                {tag.problemCount}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="inline-flex h-6 shrink-0 items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        {expanded ? "Collapse" : "Expand"}
        {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>
    </div>
  );
}
