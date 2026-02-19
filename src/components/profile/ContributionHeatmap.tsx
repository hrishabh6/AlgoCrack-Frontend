"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { HeatmapResponse } from "@/types";
import { ChevronDown, Flame } from "lucide-react";

interface ContributionHeatmapProps {
    userId: string;
}

// ─── Color Buckets ──────────────────────────────────────────────
const LEVELS = [
    "#2d333b",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
] as const;

function getLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
}

// ─── Constants ──────────────────────────────────────────────────
const CELL_GAP = 3;
const MONTH_GAP = 9; // extra px between months
const MIN_CELL = 8;
const MAX_CELL = 13;
const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Date helpers ───────────────────────────────────────────────
function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

function startOfWeekSun(d: Date): Date {
    const r = new Date(d);
    r.setDate(r.getDate() - r.getDay());
    return r;
}

function endOfWeekSat(d: Date): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + (6 - r.getDay()));
    return r;
}

function safeDate(str: string): Date {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    // Try appending time
    const d2 = new Date(str + "T00:00:00");
    if (!isNaN(d2.getTime())) return d2;
    return new Date();
}

// ─── Streak ─────────────────────────────────────────────────────
function computeMaxStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;
    let max = 1, cur = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / 86400000;
        if (diff === 1) { cur++; max = Math.max(max, cur); } else { cur = 1; }
    }
    return max;
}

function formatTooltipDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// ─── Types ──────────────────────────────────────────────────────
interface DayCell { date: string; count: number; inRange: boolean; }
interface WeekCol { days: DayCell[]; isMonthBoundary: boolean; }

// ─── Component ──────────────────────────────────────────────────
export function ContributionHeatmap({ userId }: ContributionHeatmapProps) {
    const [data, setData] = useState<HeatmapResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number, flipBelow: boolean } | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const currentYear = new Date().getFullYear();
    const yearOptions: (number | null)[] = [null, ...Array.from({ length: currentYear - 2023 }, (_, i) => currentYear - i)];

    // ── Measure container (Crucial Fix: depend on loading) ───────
    useEffect(() => {
        if (loading) return;
        const el = wrapperRef.current;
        if (!el) return;

        // Immediate measure
        setContainerWidth(el.getBoundingClientRect().width);

        const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, [loading]);

    // ── Fetch ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchHeatmap = async () => {
            setLoading(true);
            try {
                const url = selectedYear != null
                    ? `${ENDPOINTS.USER_HEATMAP}/${userId}?year=${selectedYear}`
                    : `${ENDPOINTS.USER_HEATMAP}/${userId}`;
                setData(await apiClient.get<HeatmapResponse>(url));
            } catch (err) { console.error("Failed to fetch heatmap:", err); }
            finally { setLoading(false); }
        };
        if (userId) fetchHeatmap();
    }, [userId, selectedYear]);

    // ── Activity map ────────────────────────────────────────────
    const activityMap = useMemo(() => {
        const m = new Map<string, number>();
        data?.activity.forEach((a) => {
            // Normalize date to local YYYY-MM-DD
            const parts = a.date.split("T")[0];
            const d = new Date(parts + "T00:00:00");
             if (!isNaN(d.getTime())) m.set(toDateStr(d), a.count);
        });
        return m;
    }, [data]);

    // ── Build week columns ──────────────────────────────────────
    const weeks = useMemo(() => {
        if (!data) return [] as WeekCol[];
        const from = safeDate(data.from.split("T")[0] + "T00:00:00");
        const to = safeDate(data.to.split("T")[0] + "T00:00:00");
        const gridStart = startOfWeekSun(from);
        const gridEnd = endOfWeekSat(to);

        const allDays: DayCell[] = [];
        let cur = new Date(gridStart);
        while (cur <= gridEnd) {
            const ds = toDateStr(cur);
            const inRange = cur >= from && cur <= to;
            allDays.push({ date: ds, count: inRange ? (activityMap.get(ds) ?? 0) : -1, inRange });
            cur = addDays(cur, 1);
        }

        const result: WeekCol[] = [];
        let prevMonth = -1;
        for (let i = 0; i < allDays.length; i += 7) {
            const chunk = allDays.slice(i, i + 7);
            const firstInRange = chunk.find((d) => d.inRange);
            let thisMonth = -1;
            if (firstInRange) {
                const dd = new Date(firstInRange.date + "T00:00:00");
                thisMonth = dd.getFullYear() * 12 + dd.getMonth();
            }
            const isMonthBoundary = result.length > 0 && thisMonth !== -1 && thisMonth !== prevMonth;
            if (thisMonth !== -1) prevMonth = thisMonth;
            result.push({ days: chunk, isMonthBoundary });
        }
        return result;
    }, [data, activityMap]);

    // ── Compute cell size ───────────────────────────────────────
    const { cellSize, colPositions, monthLabels, totalGridWidth, gridHeight } = useMemo(() => {
        if (weeks.length === 0 || containerWidth === 0) {
            return { cellSize: 10, colPositions: [] as number[], monthLabels: [] as { label: string; x: number }[], totalGridWidth: 0, gridHeight: 0 };
        }

        const numCols = weeks.length;
        const numMonthGaps = weeks.filter((w) => w.isMonthBoundary).length;
        const numNormalGaps = numCols - 1 - numMonthGaps;
        const totalGapSpace = numNormalGaps * CELL_GAP + numMonthGaps * (CELL_GAP + MONTH_GAP);

        let cs = Math.floor((containerWidth - totalGapSpace) / numCols);
        cs = Math.max(MIN_CELL, Math.min(MAX_CELL, cs));

        const colPos: number[] = [];
        let x = 0;
        const mLabels: { label: string; x: number }[] = [];
        const labelledMonths = new Set<number>();

        weeks.forEach((w) => {
            if (w.isMonthBoundary) x += MONTH_GAP;
            colPos.push(x);

            const firstInRange = w.days.find((d) => d.inRange);
            if (firstInRange) {
                const dd = new Date(firstInRange.date + "T00:00:00");
                const mn = dd.getFullYear() * 12 + dd.getMonth();
                if (!labelledMonths.has(mn)) {
                    labelledMonths.add(mn);
                    mLabels.push({ label: MONTHS_SHORT[dd.getMonth()], x });
                }
            }
            x += cs + CELL_GAP;
        });

        const totalW = x - CELL_GAP;
        const gh = 7 * cs + 6 * CELL_GAP;
        return { cellSize: cs, colPositions: colPos, monthLabels: mLabels, totalGridWidth: totalW, gridHeight: gh };
    }, [weeks, containerWidth]);

    const maxStreak = useMemo(() => {
        if (!data) return 0;
        return computeMaxStreak(data.activity.map((a) => a.date).sort());
    }, [data]);

    const handleMouseEnter = useCallback((e: React.MouseEvent, date: string, count: number) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();

        const tooltipHeight = 40; // approx height
        const margin = 8;

        let top = rect.top - margin;
        let flipBelow = false;

        if (top - tooltipHeight < 0) {
            // Not enough space above → show below
            top = rect.bottom + margin;
            flipBelow = true;
        }

        setTooltip({
            x: rect.left + rect.width / 2,
            y: top,
            date,
            count,
            flipBelow,
        });
    }, []);

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    if (loading || !data) {
        return (
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm min-h-[120px]">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-5 w-48 bg-muted/30 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="h-[100px] w-full bg-muted/10 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border/30 bg-card p-3 shadow-sm">
            {/* ── Stats Row ──────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg font-medium text-foreground tracking-tight">
                        {data.totalSubmissions}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        submissions in {selectedYear ?? "the past year"}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                        Total active days:{" "}
                        <span className="font-medium text-foreground">{data.totalActiveDays}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        Max streak:{" "}
                        <span className="font-medium text-foreground">{maxStreak}</span>
                    </span>
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-foreground text-[10px] font-medium"
                        >
                            {selectedYear ?? "Current"}
                            <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-1 min-w-[100px] bg-card border border-border rounded-md shadow-lg z-50 py-1">
                                {yearOptions.map((y) => (
                                    <button
                                        key={y ?? "current"}
                                        onClick={() => { setSelectedYear(y); setDropdownOpen(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors ${selectedYear === y ? "text-primary font-semibold" : "text-muted-foreground"}`}
                                    >
                                        {y ?? "Current"}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Grid Container ─────────────────────────────── */}
            <div ref={wrapperRef} className="w-full relative overflow-hidden min-h-[120px]">
                
                {/* Debug Overlay */}
                {containerWidth > 0 && weeks.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center text-red-500 text-xs font-mono bg-background/50 z-50">
                         No Data: {data.from} → {data.to}
                     </div>
                )}

                {/* Grid */}
                {containerWidth > 0 && (
                    <div className="relative pt-1" style={{ width: totalGridWidth, height: gridHeight + 8, contain: "layout paint" }}>
                        {weeks.map((week, colIdx) => (
                            <div
                                key={colIdx}
                                className="absolute flex flex-col"
                                style={{
                                    left: colPositions[colIdx],
                                    top: 0,
                                    gap: CELL_GAP,
                                }}
                            >
                                {week.days.map((day, rowIdx) => {
                                    if (!day.inRange) {
                                        return <div key={rowIdx} style={{ width: cellSize, height: cellSize }} />;
                                    }
                                    const level = getLevel(day.count);
                                    return (
                                        <div
                                            key={rowIdx}
                                            style={{
                                                width: cellSize,
                                                height: cellSize,
                                                borderRadius: 2,
                                                backgroundColor: LEVELS[level],
                                            }}
                                            className="cursor-pointer origin-center transition-transform duration-100 hover:brightness-125 hover:scale-[1.15]"
                                            onMouseEnter={(e) => handleMouseEnter(e, day.date, day.count)}
                                            onMouseLeave={handleMouseLeave}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Month labels BELOW grid */}
                {containerWidth > 0 && (
                    <div className="relative mt-1" style={{ width: totalGridWidth, height: 16 }}>
                        {monthLabels.map((m, i) => (
                            <span
                                key={i}
                                className="absolute text-[9px] text-muted-foreground select-none"
                                style={{ left: m.x }}
                            >
                                {m.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-2 text-[9px] text-muted-foreground">
                <span>Less</span>
                {LEVELS.map((color, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: color }} />
                ))}
                <span>More</span>
            </div>

            {/* Tooltip (Fixed with Portal) */}
            {tooltip && createPortal(
                <div
                    className="fixed pointer-events-none z-[9999] px-2 py-1.5 rounded bg-popover border border-border text-xs text-popover-foreground shadow-md whitespace-nowrap"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: tooltip.flipBelow
                            ? "translate(-50%, 0%)"
                            : "translate(-50%, -100%)",
                    }}
                >
                    <span className="font-medium">
                        {tooltip.count === 0
                            ? "No submissions"
                            : `${tooltip.count} submission${tooltip.count > 1 ? "s" : ""}`}
                    </span>{" "}
                    <span className="text-muted-foreground">on {formatTooltipDate(tooltip.date)}</span>
                </div>,
                document.body
            )}
        </div>
    );
}
