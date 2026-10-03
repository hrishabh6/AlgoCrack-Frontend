"use client";

import { useEffect, useState } from "react";
import { getTodayDailyChallenge } from "@/lib/api/daily-challenge-service";
import type { DailyChallengeResponse } from "@/types/daily-challenge";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyChallengeRailCard() {
  const [challenge, setChallenge] = useState<DailyChallengeResponse | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getTodayDailyChallenge()
      .then((c) => {
        if (!cancelled) setChallenge(c);
      })
      .catch(() => {
        if (!cancelled) setChallenge(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (challenge === undefined) {
    return (
      <div className="rounded-lg border bg-card p-4" aria-busy="true" aria-label="Loading daily challenge">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-2 h-8 w-full" />
      </div>
    );
  }

  return <DailyChallengeCard challenge={challenge} compact />;
}
