"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreakStore } from "@/store/useStreakStore";

export function streakHint(current: number, activeToday: boolean): string {
  if (current === 0) return "No active POTD streak. Solve today's challenge to start one.";
  const days = `${current}-day streak`;
  return activeToday ? `${days}. Today's challenge is solved.` : `${days}. Solve today's challenge to keep it going.`;
}

/** Navbar indicator for the signed-in user's POTD solve streak. */
export function StreakBadge({ className }: { className?: string }) {
  const streak = useStreakStore((s) => s.streak);
  if (!streak) return null;

  const { currentStreak, activeToday } = streak;
  const hint = streakHint(currentStreak, activeToday);
  const lit = currentStreak > 0 && activeToday;

  return (
    <Link
      href="/profile"
      title={hint}
      aria-label={hint}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[13px] font-semibold tabular-nums transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        lit ? "text-warning hover:bg-warning/10" : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <Flame className={cn("size-4", lit && "fill-warning/30")} aria-hidden="true" />
      <span className="font-mono">{currentStreak}</span>
    </Link>
  );
}
