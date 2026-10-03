"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { normalizeUnknownError } from "@/lib/error-utils";
import { UserProfileResponse } from "@/types";
import { UserCard } from "./UserCard";
import { StatsCard } from "./StatsCard";
import { RecentSubmissions } from "./RecentSubmissions";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState, PageContainer, StatCard, TagChip } from "@/components/shared";
import { CheckCircle2, Code2, LogIn, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user?.userId) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const uid = encodeURIComponent(String(user.userId));
                const data = await apiClient.get<UserProfileResponse>(
                    `${ENDPOINTS.USER_PROFILE}/${uid}?page=0&size=10`
                );
                setProfile(data);
            } catch (err) {
                const normalized = normalizeUnknownError(err, "Failed to load profile");
                if (normalized.message.includes("404")) {
                    setError("Profile is not available yet.");
                } else {
                    console.error("Failed to fetch profile:", normalized);
                    setError(normalized.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, user?.userId, authLoading]);

    const resolvedUserDetails = useMemo(() => {
        if (!profile) return null;

        const details = profile.userDetails;
        if (details.name && details.name !== details.userId) {
            return details;
        }
        if (!user?.email) {
            return details;
        }

        const fallbackName = user.email
            .split("@")[0]
            .replace(/[._-]+/g, " ")
            .trim();

        return {
            ...details,
            name: fallbackName || details.name || details.userId,
        };
    }, [profile, user?.email]);

    if (authLoading) {
        return <ProfileSkeleton />;
    }

    if (!isAuthenticated) {
        return (
            <PageContainer size="narrow" className="flex min-h-[60vh] items-center justify-center">
                <EmptyState
                    icon={<LogIn />}
                    title="Sign in to view your profile"
                    description="Log in to track your progress and see your stats."
                    action={
                        <Button asChild size="sm">
                            <Link href={`/auth/signin?next=${encodeURIComponent("/profile")}`}>Sign in</Link>
                        </Button>
                    }
                />
            </PageContainer>
        );
    }

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <PageContainer size="narrow" className="flex min-h-[60vh] items-center justify-center">
                <EmptyState tone="error" title="Something went wrong" description={error} />
            </PageContainer>
        );
    }

    if (!profile) {
        return null;
    }

    const details = resolvedUserDetails ?? profile.userDetails;
    const { userStats, languageStats } = profile;
    const completionRatio = userStats.totalQuestions > 0
        ? Math.round((userStats.totalSolved / userStats.totalQuestions) * 100)
        : 0;
    const skills = details.skills
        ? details.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    const maxLanguageSolved = Math.max(1, ...languageStats.map((l) => l.problemsSolved));

    return (
        <PageContainer className="space-y-4">
            <UserCard user={details} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                {/* Main column */}
                <div className="min-w-0 space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <StatCard
                            label="Solved"
                            icon={<CheckCircle2 />}
                            value={userStats.totalSolved}
                            helper={`of ${userStats.totalQuestions} problems`}
                        />
                        <StatCard
                            label="Completion"
                            icon={<Percent />}
                            value={`${completionRatio}%`}
                            helper="of all problems"
                        />
                        <StatCard
                            label="Languages"
                            icon={<Code2 />}
                            value={languageStats.length}
                            helper={languageStats.length === 1 ? "language used" : "languages used"}
                        />
                    </div>

                    <section className="rounded-lg border bg-card p-5" aria-label="Solved by difficulty">
                        <StatsCard stats={userStats} />
                    </section>

                    <section className="rounded-lg border bg-card p-5" aria-label="Activity">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Activity</h2>
                        <ContributionHeatmap userId={user!.userId} />
                    </section>

                    <section className="overflow-hidden rounded-lg border bg-card">
                        <RecentSubmissions submissions={profile.recentSubmissions} />
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
                    {details.about && (
                        <SidebarSection title="About">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                                {details.about}
                            </p>
                        </SidebarSection>
                    )}

                    <SidebarSection title="Languages">
                        {languageStats.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No accepted solutions yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {languageStats.map((lang) => (
                                    <li key={lang.language}>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="font-mono text-foreground">{lang.language}</span>
                                            <span className="font-mono tabular-nums text-muted-foreground">
                                                {lang.problemsSolved} solved
                                            </span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded-full bg-accent">
                                            <div
                                                className="h-full rounded-full bg-primary/80"
                                                style={{ width: `${(lang.problemsSolved / maxLanguageSolved) * 100}%` }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SidebarSection>

                    {skills.length > 0 && (
                        <SidebarSection title="Skills">
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map((skill) => (
                                    <TagChip key={skill}>{skill}</TagChip>
                                ))}
                            </div>
                        </SidebarSection>
                    )}
                </aside>
            </div>
        </PageContainer>
    );
}

function SidebarSection({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={cn("rounded-lg border bg-card p-4", className)} aria-label={title}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
            {children}
        </section>
    );
}

function ProfileSkeleton() {
    return (
        <PageContainer className="space-y-4" aria-busy="true" aria-label="Loading profile">
            <div className="flex items-center gap-4 rounded-lg border bg-card p-6">
                <Skeleton className="size-16 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3.5 w-72 max-w-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-[92px] w-full rounded-lg" />
                        ))}
                    </div>
                    <Skeleton className="h-44 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </div>
        </PageContainer>
    );
}
