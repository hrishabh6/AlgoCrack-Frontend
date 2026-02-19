"use client";

import { UserStats } from "@/types";

interface StatsCardProps {
    stats: UserStats;
}

export function StatsCard({ stats }: StatsCardProps) {
    const { totalSolved, totalQuestions, easySolved, easyTotal, mediumSolved, mediumTotal, hardSolved, hardTotal } = stats;

    const size = 120;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const easyPercent = totalQuestions > 0 ? (easySolved / totalQuestions) * 100 : 0;
    const mediumPercent = totalQuestions > 0 ? (mediumSolved / totalQuestions) * 100 : 0;
    const hardPercent = totalQuestions > 0 ? (hardSolved / totalQuestions) * 100 : 0;

    const easyDash = (easyPercent / 100) * circumference;
    const mediumDash = (mediumPercent / 100) * circumference;
    const hardDash = (hardPercent / 100) * circumference;

    const easyOffset = 0;
    const mediumOffset = -(easyDash);
    const hardOffset = -(easyDash + mediumDash);

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Solved Problems</h2>

            <div className="grid grid-cols-[120px_1fr] gap-8 items-center">
                {/* Donut Chart */}
                <div className="relative w-[120px] h-[120px]">
                    <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        className="-rotate-90"
                    >
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-muted-foreground/20"
                        />

                        {/* Segments */}
                        {easySolved > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${easyDash} ${circumference - easyDash}`}
                                strokeDashoffset={easyOffset}
                                strokeLinecap="round"
                            />
                        )}
                        {mediumSolved > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="#eab308"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${mediumDash} ${circumference - mediumDash}`}
                                strokeDashoffset={mediumOffset}
                                strokeLinecap="round"
                            />
                        )}
                        {hardSolved > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${hardDash} ${circumference - hardDash}`}
                                strokeDashoffset={hardOffset}
                                strokeLinecap="round"
                            />
                        )}
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-foreground">
                            {totalSolved}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                            Solved
                        </span>
                    </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="space-y-4 w-full">
                    <DifficultyRow
                        label="Easy"
                        solved={easySolved}
                        total={easyTotal}
                        color="text-green-500"
                        bg="bg-green-500"
                    />
                    <DifficultyRow
                        label="Medium"
                        solved={mediumSolved}
                        total={mediumTotal}
                        color="text-yellow-500"
                        bg="bg-yellow-500"
                    />
                    <DifficultyRow
                        label="Hard"
                        solved={hardSolved}
                        total={hardTotal}
                        color="text-red-500"
                        bg="bg-red-500"
                    />
                </div>
            </div>
        </div>
    );
}

interface DifficultyRowProps {
    label: string;
    solved: number;
    total: number;
    color: string;
    bg: string;
}

function DifficultyRow({ label, solved, total, color, bg }: DifficultyRowProps) {
    const percent = total > 0 ? (solved / total) * 100 : 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground w-16">{label}</span>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{solved}</span>
                    <span className="text-muted-foreground text-[10px]">/{total}</span>
                    <span className={`ml-3 w-8 text-right font-medium ${total > 0 && solved > 0 ? color : 'text-muted-foreground'}`}>
                        {percent > 0 ? `${percent.toFixed(1)}%` : 'N/A'}
                    </span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${bg} opacity-80`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
