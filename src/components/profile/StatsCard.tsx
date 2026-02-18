"use client";

import { UserStats } from "@/types";

interface StatsCardProps {
    stats: UserStats;
}

export function StatsCard({ stats }: StatsCardProps) {
    const { totalSolved, totalQuestions, easySolved, easyTotal, mediumSolved, mediumTotal, hardSolved, hardTotal } = stats;

    const size = 180;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const easyPercent = totalQuestions > 0 ? (easySolved / totalQuestions) * 100 : 0;
    const mediumPercent = totalQuestions > 0 ? (mediumSolved / totalQuestions) * 100 : 0;
    const hardPercent = totalQuestions > 0 ? (hardSolved / totalQuestions) * 100 : 0;
    const totalPercent = totalQuestions > 0 ? (totalSolved / totalQuestions) * 100 : 0;

    const easyDash = (easyPercent / 100) * circumference;
    const mediumDash = (mediumPercent / 100) * circumference;
    const hardDash = (hardPercent / 100) * circumference;

    const easyOffset = 0;
    const mediumOffset = -(easyDash);
    const hardOffset = -(easyDash + mediumDash);

    return (
        <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-8 shadow-lg relative overflow-hidden group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                Solved Problems
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Donut Chart */}
                <div className="relative shrink-0">
                    {/* Shadow/Glow behind chart */}
                    <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl transform scale-90" />
                    
                    <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        className="-rotate-90 transform hover:scale-105 transition-transform duration-500"
                    >
                        {/* Define gradients */}
                        <defs>
                            <linearGradient id="gradientEasy" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="100%" stopColor="#86efac" />
                            </linearGradient>
                            <linearGradient id="gradientMedium" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#fde047" />
                            </linearGradient>
                            <linearGradient id="gradientHard" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#fca5a5" />
                            </linearGradient>
                        </defs>

                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-muted/20"
                        />
                        
                        {/* Segments */}
                        {easySolved > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="url(#gradientEasy)"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${easyDash} ${circumference - easyDash}`}
                                strokeDashoffset={easyOffset}
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out animate-in fade-in zoom-in-50"
                            />
                        )}
                        {mediumSolved > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="url(#gradientMedium)"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${mediumDash} ${circumference - mediumDash}`}
                                strokeDashoffset={mediumOffset}
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out animate-in fade-in zoom-in-50 delay-150"
                            />
                        )}
                        {hardSolved > 0 && (
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="url(#gradientHard)"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${hardDash} ${circumference - hardDash}`}
                                strokeDashoffset={hardOffset}
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-1000 ease-out animate-in fade-in zoom-in-50 delay-300"
                            />
                        )}
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
                            {totalSolved}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                            Solved
                        </span>
                    </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="flex-1 w-full space-y-6">
                    <DifficultyRow
                        label="Easy"
                        solved={easySolved}
                        total={easyTotal}
                        color="bg-green-500"
                        gradient="from-green-500 to-green-400"
                        textColor="text-green-500"
                        bgParams="bg-green-500/10"
                    />
                    <DifficultyRow
                        label="Medium"
                        solved={mediumSolved}
                        total={mediumTotal}
                        color="bg-yellow-500"
                        gradient="from-yellow-500 to-yellow-400"
                        textColor="text-yellow-500"
                        bgParams="bg-yellow-500/10"
                    />
                    <DifficultyRow
                        label="Hard"
                        solved={hardSolved}
                        total={hardTotal}
                        color="bg-red-500"
                        gradient="from-red-500 to-red-400"
                        textColor="text-red-500"
                        bgParams="bg-red-500/10"
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
    color: string; // Tailwind class for text color (e.g. text-green-500)
    gradient: string;
    textColor: string;
    bgParams: string;
}

function DifficultyRow({ label, solved, total, gradient, textColor, bgParams }: DifficultyRowProps) {
    const percent = total > 0 ? (solved / total) * 100 : 0;

    return (
        <div className="space-y-2 group">
            <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${textColor} w-16`}>{label}</span>
                <div className="flex items-baseline gap-1 text-muted-foreground">
                    <span className="text-lg font-bold text-foreground">{solved}</span>
                    <span className="text-xs">/{total}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    {percent.toFixed(1)}%
                </span>
            </div>
            <div className={`h-2.5 rounded-full overflow-hidden ${bgParams} border border-border/50`}>
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-all duration-1000 ease-out group-hover:shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
