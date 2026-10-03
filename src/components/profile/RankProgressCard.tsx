import type { UserProgressResponse } from "@/types/progress";
import { Progress } from "@/components/ui/progress";

type RankProgressCardProps = {
  progress: UserProgressResponse;
};

export function RankProgressCard({ progress }: RankProgressCardProps) {
  const { tier, score } = progress;
  return (
    <section className="rounded-lg border bg-card p-5" aria-label="Rank progress">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            AlgoCrack rank
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {tier.name}{" "}
            <span className="font-mono text-sm font-normal text-muted-foreground">
              ({tier.code})
            </span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Score {score.total.toLocaleString()}
            {progress.leaderboardPosition != null && (
              <> · Global #{progress.leaderboardPosition}</>
            )}
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {progress.algorithmVersion}
        </p>
      </div>

      {tier.nextThreshold != null && tier.pointsToNext != null ? (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {tier.nextTierCode ?? "next tier"}</span>
            <span>{tier.pointsToNext} pts left</span>
          </div>
          <Progress value={tier.progressPercent} className="h-2" />
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">Top tier reached.</p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-md bg-muted/40 p-2">
          <dt className="text-muted-foreground">Mastery</dt>
          <dd className="font-semibold tabular-nums">{score.mastery}</dd>
        </div>
        <div className="rounded-md bg-muted/40 p-2">
          <dt className="text-muted-foreground">POTD</dt>
          <dd className="font-semibold tabular-nums">{score.potd}</dd>
        </div>
        <div className="rounded-md bg-muted/40 p-2">
          <dt className="text-muted-foreground">Breadth</dt>
          <dd className="font-semibold tabular-nums">{score.breadth}</dd>
        </div>
      </dl>
    </section>
  );
}
