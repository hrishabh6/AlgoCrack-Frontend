"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, Info, Search, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStreakStore } from "@/store/useStreakStore";
import { useUserProgressStore } from "@/store/useUserProgressStore";
import type { HeatmapResponse } from "@/types";
import { MOCK_FRIENDS_CHECKED_IN, MOCK_TRENDING_COMPANIES } from "./rail/mock-data";
import { DailyChallengeRailCard } from "@/components/daily-challenge/DailyChallengeRailCard";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const COMPANIES_PER_PAGE = 10;

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function RailCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-lg border bg-card p-4", className)}>{children}</section>;
}

/** Year of submission activity for the signed-in user, cached per year for month navigation. */
function useActivity(year: number) {
  const { isAuthenticated, user } = useAuth();
  const userId = isAuthenticated && user?.userId ? String(user.userId) : null;
  const [cache, setCache] = useState<Record<string, Map<string, number>>>({});
  const cacheKey = userId ? `${userId}:${year}` : null;

  useEffect(() => {
    if (!userId || !cacheKey || cache[cacheKey]) return;
    let cancelled = false;
    apiClient
      .get<HeatmapResponse>(`${ENDPOINTS.USER_HEATMAP}/${encodeURIComponent(userId)}?year=${year}`)
      .then((res) => {
        if (cancelled) return;
        setCache((prev) => ({ ...prev, [cacheKey]: new Map(res.activity.map((a) => [a.date, a.count])) }));
      })
      .catch(() => {
        if (!cancelled) setCache((prev) => ({ ...prev, [cacheKey]: new Map() }));
      });
    return () => {
      cancelled = true;
    };
  }, [userId, cacheKey, year, cache]);

  return cacheKey ? cache[cacheKey] : undefined;
}

function CalendarCard() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const activity = useActivity(view.getFullYear());
  const streak = useStreakStore((s) => s.streak);

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = new Date(year, month, 1).getDay();
  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayWeek = isCurrentMonth ? Math.floor((leading + today.getDate() - 1) / 7) : -1;
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() : null;
  const activeInMonth = activity
    ? Array.from({ length: daysInMonth }, (_, i) => activity.get(dateKey(new Date(year, month, i + 1))) ?? 0).filter(
        (c) => c > 0
      ).length
    : 0;

  const weekActive = weeks.map((week) =>
    week.some((day) => day !== null && (activity?.get(dateKey(new Date(year, month, day))) ?? 0) > 0)
  );

  return (
    <RailCard>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">Day {today.getDate()}</span>
          <span className="text-xs text-muted-foreground">
            {view.toLocaleString(undefined, { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setView(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setView(new Date(year, month + 1, 1))}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-[11px] font-medium text-subtle-foreground">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const date = new Date(year, month, day);
          const count = activity?.get(dateKey(date)) ?? 0;
          const isToday = isCurrentMonth && day === today.getDate();
          const future = date > today;
          return (
            <span key={i} className="flex justify-center">
              <span
                title={count > 0 ? `${count} submission${count === 1 ? "" : "s"}` : undefined}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs tabular-nums",
                  future ? "text-subtle-foreground/60" : "text-muted-foreground",
                  count > 0 && "bg-primary/20 font-medium text-primary",
                  isToday && "bg-success font-semibold text-success-foreground"
                )}
              >
                {day}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mt-4 rounded-md bg-surface-2 p-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-warning">Weekly progress</span>
          <span className="text-muted-foreground">
            {daysLeft !== null ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left` : `${activeInMonth} active days`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          {weeks.map((_, w) => (
            <span key={w} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-[10px] font-semibold",
                  weekActive[w]
                    ? "border-warning/60 bg-warning/20 text-warning"
                    : w === todayWeek
                      ? "border-border-strong text-foreground"
                      : "border-border text-subtle-foreground"
                )}
              >
                W{w + 1}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className={cn("size-4", streak && streak.currentStreak > 0 ? "text-warning" : "text-subtle-foreground")} />
          <span className="font-mono tabular-nums text-foreground">{streak?.currentStreak ?? 0}</span> day streak
        </span>
        <span className="text-muted-foreground">
          Best <span className="font-mono tabular-nums text-foreground">{streak?.longestStreak ?? 0}</span>
        </span>
      </div>
    </RailCard>
  );
}

function ProgressCard() {
  const stats = useUserProgressStore((s) => s.stats);
  if (!stats) return null;
  const rows = [
    { label: "Easy", solved: stats.easySolved, total: stats.easyTotal, bar: "bg-success", text: "text-success" },
    { label: "Medium", solved: stats.mediumSolved, total: stats.mediumTotal, bar: "bg-warning", text: "text-warning" },
    { label: "Hard", solved: stats.hardSolved, total: stats.hardTotal, bar: "bg-destructive", text: "text-destructive" },
  ];
  return (
    <RailCard>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Progress</h2>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          <span className="text-foreground">{stats.totalSolved}</span>/{stats.totalQuestions}
        </span>
      </div>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className={row.text}>{row.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {row.solved}/{row.total}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", row.bar)}
                style={{ width: `${row.total > 0 ? (row.solved / row.total) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}

function FriendsCard() {
  return (
    <RailCard className="py-3">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-semibold text-foreground">Friends Check-in</h2>
        <Info className="size-3.5 text-subtle-foreground" aria-hidden="true" />
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="size-3.5" aria-hidden="true" />
        {MOCK_FRIENDS_CHECKED_IN} friends checked in today
      </p>
    </RailCard>
  );
}

function TrendingCompaniesCard() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const matches = MOCK_TRENDING_COMPANIES.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(matches.length / COMPANIES_PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const visible = matches.slice(current * COMPANIES_PER_PAGE, (current + 1) * COMPANIES_PER_PAGE);

  return (
    <RailCard>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Trending Companies</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="bg-surface-2"
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            aria-label="Previous companies"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="bg-surface-2"
            onClick={() => setPage(Math.min(pageCount - 1, current + 1))}
            disabled={current >= pageCount - 1}
            aria-label="Next companies"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="relative mb-3">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-subtle-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search for a company..."
          aria-label="Search companies"
          className="h-8 w-full rounded-md border border-border bg-surface-2 pl-8 pr-2 text-xs text-foreground outline-none placeholder:text-subtle-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
      </div>
      {visible.length === 0 ? (
        <p className="text-xs text-muted-foreground">No companies found.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {visible.map((company) => (
            <span
              key={company.name}
              className="inline-flex h-6 items-center gap-1.5 rounded-full bg-surface-2 pl-2.5 pr-1 text-xs text-foreground"
            >
              {company.name}
              <span className="rounded-full bg-warning px-1.5 font-mono text-[10px] font-semibold tabular-nums text-warning-foreground">
                {company.problemCount}
              </span>
            </span>
          ))}
        </div>
      )}
    </RailCard>
  );
}

function SignInCard() {
  return (
    <RailCard>
      <h2 className="text-sm font-semibold text-foreground">Track your practice</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Sign in to see your submission calendar, streak and progress.
      </p>
      <Button size="sm" className="mt-3 w-full" asChild>
        <Link href={`/auth/signin?next=${encodeURIComponent("/problems")}`}>Sign in</Link>
      </Button>
    </RailCard>
  );
}

/** Right rail of the problems workspace. Calendar, streak and progress are real; see mock-data.ts. */
export function ProblemsRail() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return (
    <>
      <DailyChallengeRailCard />
      {isAuthenticated ? <CalendarCard /> : <SignInCard />}
      {isAuthenticated && <ProgressCard />}
      <FriendsCard />
      <TrendingCompaniesCard />
    </>
  );
}
