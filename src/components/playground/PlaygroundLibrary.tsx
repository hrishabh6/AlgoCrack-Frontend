"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlaygroundSummary } from "@/types/playground";
import { Plus, Trash2 } from "lucide-react";

type PlaygroundLibraryProps = {
  items: PlaygroundSummary[];
  activeId: number | null;
  onNew: () => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  className?: string;
};

export function PlaygroundLibrary({
  items,
  activeId,
  onNew,
  onSelect,
  onDelete,
  className,
}: PlaygroundLibraryProps) {
  return (
    <aside className={cn("flex h-full min-h-0 flex-col border-r bg-card", className)}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onNew}>
          <Plus className="h-3.5 w-3.5" />
          New
        </Button>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {items.length === 0 && (
          <li className="px-2 py-4 text-center text-xs text-muted-foreground">No saved playgrounds yet.</li>
        )}
        {items.map((item) => (
          <li key={item.id} className="mb-1">
            <div
              className={cn(
                "group flex items-start gap-1 rounded-md border px-2 py-2 text-left text-sm transition-colors",
                activeId === item.id ? "border-primary/40 bg-primary/5" : "border-transparent hover:bg-muted/60"
              )}
            >
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelect(item.id)}>
                <div className="truncate font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.language}</div>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
