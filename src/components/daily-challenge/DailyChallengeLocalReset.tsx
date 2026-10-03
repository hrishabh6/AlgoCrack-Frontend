"use client";

import { useEffect, useState } from "react";

/** Formats nextResetAt in the viewer's local timezone. */
export function formatChallengeResetLocal(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

type DailyChallengeLocalResetProps = {
  nextResetAt: string;
  /** e.g. "resets" or "Next challenge" */
  label?: string;
  className?: string;
};

export function DailyChallengeLocalReset({
  nextResetAt,
  label = "resets",
  className,
}: DailyChallengeLocalResetProps) {
  const [localReset, setLocalReset] = useState<string | null>(null);

  useEffect(() => {
    setLocalReset(formatChallengeResetLocal(nextResetAt));
  }, [nextResetAt]);

  return (
    <span className={className} suppressHydrationWarning>
      {label} {localReset ?? "…"}
    </span>
  );
}
