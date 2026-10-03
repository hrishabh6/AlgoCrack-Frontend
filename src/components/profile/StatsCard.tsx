"use client";

import { UserStats } from "@/types";
import { DIFFICULTY_BAR, DIFFICULTY_TEXT } from "@/components/shared";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    stats: UserStats;
}

export function StatsCard({ stats }: StatsCardProps) {
    const {
        totalSolved, totalQuestions,
        easySolved, easyTotal,
        mediumSolved, mediumTotal,
        hardSolved, hardTotal,
    } = stats;

    const completion = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

    return (
        <div className="space-y-5">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">Problems solved</p>
                    <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                        {totalSolved}
                        <span className="ml-1 text-base font-normal text-subtle-foreground">/ {totalQuestions}</span>
                    </p>
                </div>
                <p className="font-mono text-sm tabular-nums text-muted-foreground">
                    <span className="text-foreground">{completion}%</span> complete
                </p>
            </div>

            <div className="space-y-3.5">
                <DifficultyRow label="Easy" solved={easySolved} total={easyTotal} />
                <DifficultyRow label="Medium" solved={mediumSolved} total={mediumTotal} />
                <DifficultyRow label="Hard" solved={hardSolved} total={hardTotal} />
            </div>
        </div>
    );
}

interface DifficultyRowProps {
    label: "Easy" | "Medium" | "Hard";
    solved: number;
    total: number;
}

function DifficultyRow({ label, solved, total }: DifficultyRowProps) {
    const pct = total > 0 ? Math.min(100, (solved / total) * 100) : 0;
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
                <span className={cn("font-medium", DIFFICULTY_TEXT[label])}>{label}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                    <span className="text-foreground">{solved}</span> / {total}
                </span>
            </div>
            <div
                className="h-1.5 overflow-hidden rounded-full bg-accent"
                role="progressbar"
                aria-label={`${label} problems solved`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={solved}
            >
                <div
                    className={cn("h-full rounded-full transition-[width] duration-300 ease-out", DIFFICULTY_BAR[label])}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
