"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { UserProfileResponse } from "@/types";
import { UserCard } from "./UserCard";
import { StatsCard } from "./StatsCard";
import { RecentSubmissions } from "./RecentSubmissions";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

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
                const data = await apiClient.get<UserProfileResponse>(
                    `${ENDPOINTS.USER_PROFILE}/${user.userId}?page=0&size=10`
                );
                setProfile(data);
            } catch (err: any) {
                console.error("Failed to fetch profile:", err);
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, user?.userId, authLoading]);

    // Auth loading
    if (authLoading) {
        return <ProfileSkeleton />;
    }

    // Not logged in
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold text-foreground">Sign in to view your profile</h2>
                <p className="mt-2 text-sm">Log in to track your progress and see your stats.</p>
            </div>
        );
    }

    // Loading
    if (loading) {
        return <ProfileSkeleton />;
    }

    // Error
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4 text-red-500/50" />
                <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
                <p className="mt-2 text-sm">{error}</p>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen w-full relative">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2" />
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
                    {/* Left Sidebar */}
                    <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
                        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
                            <UserCard
                                user={profile.userDetails}
                                languageStats={profile.languageStats}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Stats */}
                        <section>
                            <StatsCard stats={profile.userStats} />
                        </section>

                        {/* Contribution Heatmap */}
                        <section>
                            <ContributionHeatmap userId={user!.userId} />
                        </section>

                        {/* Recent Submissions */}
                        <section>
                            <RecentSubmissions submissions={profile.recentSubmissions} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                {/* Left sidebar skeleton */}
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-3 pt-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                </div>

                {/* Right content skeleton */}
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="flex items-center gap-8">
                            <Skeleton className="h-40 w-40 rounded-full" />
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
