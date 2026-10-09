"use client";

import { DifficultyBadge } from "@/components/shared";
import { ProblemActions } from "@/components/problems/problem-actions";
import { useEditorStore } from "@/store";
import { FocusModeToggle } from "./FocusModeToggle";

export function FocusModeBar() {
  const currentProblem = useEditorStore((s) => s.currentProblem);

  return (
    <div
      className="flex h-10 shrink-0 items-center gap-2 border-b bg-surface-2 px-2 sm:px-3"
      role="toolbar"
      aria-label="Problem workspace"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="truncate text-sm font-medium text-foreground">
          {currentProblem?.questionTitle ?? "Problem"}
        </h1>
        {currentProblem?.difficultyLevel && (
          <DifficultyBadge difficulty={currentProblem.difficultyLevel} className="shrink-0" />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ProblemActions />
        <FocusModeToggle exitVariant />
      </div>
    </div>
  );
}
