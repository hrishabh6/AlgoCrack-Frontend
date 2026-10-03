import Link from "next/link";
import type { UserBadgesResponse } from "@/types/progress";
import { Award, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type ProfileBadgesSectionProps = {
  badges: UserBadgesResponse;
};

export function ProfileBadgesSection({ badges }: ProfileBadgesSectionProps) {
  const recent = badges.earned.slice(0, 4);
  const nextLocked = badges.locked
    .filter((b) => b.progressTarget != null && b.progressTarget > 0)
    .slice(0, 2);

  return (
    <section className="rounded-lg border bg-card p-5" aria-label="Badges">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          Badges{" "}
          <span className="font-normal text-muted-foreground">
            ({badges.earned.length} earned)
          </span>
        </h2>
        <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No badges earned yet. Keep solving!</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((badge) => (
            <li
              key={badge.code}
              className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
            >
              <Award className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {nextLocked.length > 0 && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Up next
          </p>
          {nextLocked.map((badge) => {
            const target = badge.progressTarget ?? 1;
            const current = badge.progressCurrent ?? 0;
            const pct = Math.min(100, Math.round((current / target) * 100));
            return (
              <div key={badge.code} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="size-3.5 text-muted-foreground" aria-hidden />
                  <span>{badge.name}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {current}/{target}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
