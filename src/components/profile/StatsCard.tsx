"use client";

import { UserStats } from "@/types";

interface StatsCardProps {
    stats: UserStats;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
    // Clamp to avoid degenerate arcs
    const span = endDeg - startDeg;
    if (span <= 0) return "";
    const start = polarToCartesian(cx, cy, r, startDeg);
    const end   = polarToCartesian(cx, cy, r, endDeg);
    const large = span > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function StatsCard({ stats }: StatsCardProps) {
    const {
        totalSolved, totalQuestions,
        easySolved,   easyTotal,
        mediumSolved, mediumTotal,
        hardSolved,   hardTotal,
    } = stats;

    // ── Ring geometry ────────────────────────────────────────────────
    const SIZE = 160;
    const SW   = 7;            // thin = premium
    const CX   = SIZE / 2;
    const CY   = SIZE / 2;
    const R    = (SIZE - SW) / 2 - 2;  // slightly larger radius to compensate thinner stroke

    // Total ring span: 285° — generous open gap at bottom for breathing room
    const RING_SPAN  = 285;
    const RING_START = -140;   // slightly shifted up, gap centered lower

    // Gap BETWEEN the three difficulty track sections
    // Larger gap needed because round linecaps visually eat into the gap
    const GAP = 10; // degrees

    // Each difficulty gets an EQUAL fixed container arc — never shrinks
    // The fill inside each container is what's dynamic
    const SEGMENT = (RING_SPAN - GAP * 2) / 3;

    const easyTrackDeg   = SEGMENT;
    const mediumTrackDeg = SEGMENT;
    const hardTrackDeg   = SEGMENT;

    // Platform-level totals (global capacity — NOT user dependent)
    // These ensure tracks always have meaningful fill ratios even if backend returns 0
    const PLATFORM_EASY   = easyTotal   > 0 ? easyTotal   : 927;
    const PLATFORM_MEDIUM = mediumTotal > 0 ? mediumTotal : 2010;
    const PLATFORM_HARD   = hardTotal   > 0 ? hardTotal   : 909;

    // Filled (bright) arc = proportion of solved within that fixed container
    const easyFillDeg   = (easySolved   / PLATFORM_EASY)   * SEGMENT;
    const mediumFillDeg = (mediumSolved / PLATFORM_MEDIUM) * SEGMENT;
    const hardFillDeg   = (hardSolved   / PLATFORM_HARD)   * SEGMENT;

    // Colors — bright saturated fill + very muted dark track (almost blends into background)
    const EASY_FILL    = "#00b8a3";   const EASY_TRACK   = "#0f2522";
    const MEDIUM_FILL  = "#ffc01e";   const MEDIUM_TRACK = "#2b2107";
    const HARD_FILL    = "#ef4743";   const HARD_TRACK   = "#2b1212";

    // Place the three track sections sequentially with GAP between them
    const easyTrackStart   = RING_START;
    const easyTrackEnd     = easyTrackStart + easyTrackDeg;

    const mediumTrackStart = easyTrackEnd + GAP;
    const mediumTrackEnd   = mediumTrackStart + mediumTrackDeg;

    const hardTrackStart   = mediumTrackEnd + GAP;
    const hardTrackEnd     = hardTrackStart + hardTrackDeg;

    // Tracks ALWAYS render — they represent capacity, not solved count
    const easyTrackPath   = arcPath(CX, CY, R, easyTrackStart,   easyTrackEnd);
    const mediumTrackPath = arcPath(CX, CY, R, mediumTrackStart, mediumTrackEnd);
    const hardTrackPath   = arcPath(CX, CY, R, hardTrackStart,   hardTrackEnd);

    // Bright fill paths — only render if something is solved
    const easyFillPath   = easyFillDeg   > 0.5 ? arcPath(CX, CY, R, easyTrackStart,   easyTrackStart   + easyFillDeg)   : "";
    const mediumFillPath = mediumFillDeg > 0.5 ? arcPath(CX, CY, R, mediumTrackStart, mediumTrackStart + mediumFillDeg) : "";
    const hardFillPath   = hardFillDeg   > 0.5 ? arcPath(CX, CY, R, hardTrackStart,   hardTrackStart   + hardFillDeg)   : "";

    const safeTotal = totalQuestions > 0 ? totalQuestions : 1;

    return (
        <div className="rounded-xl border border-white/5 bg-card p-4 shadow-none">
            <div className="grid grid-cols-[180px_1fr] gap-6 items-center">

                {/* ── Ring ── */}
                <div className="relative w-[160px] h-[160px] mx-auto">
                    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} overflow="visible">

                        {/* ── EASY: dim track then bright fill ── */}
                        {easyTrackPath && (
                            <path d={easyTrackPath}   fill="none" stroke={EASY_TRACK}   strokeWidth={SW} strokeLinecap="round" />
                        )}
                        {easyFillPath && (
                            <path d={easyFillPath}    fill="none" stroke={EASY_FILL}    strokeWidth={SW + 0.5} strokeLinecap="round" />
                        )}

                        {/* ── MEDIUM: dim track then bright fill ── */}
                        {mediumTrackPath && (
                            <path d={mediumTrackPath} fill="none" stroke={MEDIUM_TRACK} strokeWidth={SW} strokeLinecap="round" />
                        )}
                        {mediumFillPath && (
                            <path d={mediumFillPath}  fill="none" stroke={MEDIUM_FILL}  strokeWidth={SW + 0.5} strokeLinecap="round" />
                        )}

                        {/* ── HARD: dim track then bright fill ── */}
                        {hardTrackPath && (
                            <path d={hardTrackPath}   fill="none" stroke={HARD_TRACK}   strokeWidth={SW} strokeLinecap="round" />
                        )}
                        {hardFillPath && (
                            <path d={hardFillPath}    fill="none" stroke={HARD_FILL}    strokeWidth={SW + 0.5} strokeLinecap="round" />
                        )}
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <div className="text-2xl font-medium text-foreground tracking-tight flex items-baseline gap-1">
                            {totalSolved}
                            <span className="text-xs text-muted-foreground/60 font-medium">/{safeTotal}</span>
                        </div>
                        <div className="text-[13px] font-medium text-muted-foreground mt-0.5">Solved</div>
                    </div>
                </div>

                {/* ── Difficulty boxes ── */}
                <div className="flex flex-col gap-2.5 w-full">
                    <DifficultyBox label="Easy"   solved={easySolved}   total={easyTotal}   labelColor="text-[#00b8a3]" />
                    <DifficultyBox label="Medium" solved={mediumSolved} total={mediumTotal} labelColor="text-[#ffc01e]" />
                    <DifficultyBox label="Hard"   solved={hardSolved}   total={hardTotal}   labelColor="text-[#ef4743]" />
                </div>
            </div>
        </div>
    );
}

interface DifficultyBoxProps {
    label: string;
    solved: number;
    total: number;
    labelColor: string;
}

function DifficultyBox({ label, solved, total, labelColor }: DifficultyBoxProps) {
    return (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 rounded-lg min-h-[44px]">
            <span className={`text-[13px] font-medium ${labelColor}`}>{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-[14px] font-medium text-foreground">{solved}</span>
                <span className="text-[12px] text-muted-foreground/60">/{total}</span>
            </div>
        </div>
    );
}