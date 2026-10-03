import Link from "next/link";
import { ArrowRight, CalendarClock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/shared";
import type { DailyChallengeResponse } from "@/types/daily-challenge";
import { cn } from "@/lib/utils";

type DailyChallengeCardProps = {
  challenge: DailyChallengeResponse | null;
  compact?: boolean;
  className?: string;
};

function formatUtcReset(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: "UTC",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(iso));
  } catch {
    return "00:00 UTC";
  }
}

export function DailyChallengeCard({ challenge, compact, className }: DailyChallengeCardProps) {
  if (!challenge) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed bg-surface/50 p-4 text-sm text-muted-foreground",
          className
        )}
        role="status"
      >
        <p className="font-medium text-foreground">Daily challenge</p>
        <p className="mt-1 text-xs">No challenge is scheduled for today yet. Check back soon.</p>
      </div>
    );
  }

  const { problem, challengeDate, nextResetAt } = challenge;
  const href = `/problems/${problem.id}`;

  if (compact) {
    return (
      <section className={cn("rounded-lg border bg-card p-4", className)} aria-labelledby="potd-rail-heading">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="potd-rail-heading" className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              Daily Challenge
            </h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {challengeDate} · resets {formatUtcReset(nextResetAt)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium leading-snug text-foreground">{problem.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.primaryTopic && (
            <span className="text-xs text-muted-foreground">{problem.primaryTopic}</span>
          )}
        </div>
        <Button asChild size="sm" className="mt-3 w-full">
          <Link href={href}>Solve today&apos;s challenge</Link>
        </Button>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8",
        className
      )}
      aria-labelledby="potd-home-heading"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Problem of the day
          </p>
          <h2 id="potd-home-heading" className="text-2xl font-semibold tracking-tight text-foreground">
            {problem.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.primaryTopic && (
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted-foreground">
                {problem.primaryTopic}
              </span>
            )}
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
            UTC date {challengeDate} · next reset {formatUtcReset(nextResetAt)}
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={href}>
            Solve challenge
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
