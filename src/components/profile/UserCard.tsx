import Link from "next/link";
import { UserDetails } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    GraduationCap,
    Globe,
    Github,
    Twitter,
    Linkedin,
    ArrowRight,
    History,
} from "lucide-react";

interface UserCardProps {
    user: UserDetails;
    rankTier?: string | null;
    totalScore?: number | null;
    leaderboardPosition?: number | null;
}

function resolveSocialUrl(value: string, base: string): string {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `${base}${value}`;
}

/** Identity header for the profile page: avatar, name, headline and profile links. */
export function UserCard({ user, rankTier, totalScore, leaderboardPosition }: UserCardProps) {
    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    const fallbackAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${user.userId}&backgroundColor=e5e7eb`;

    const links = [
        user.location && { icon: MapPin, label: user.location },
        user.school && { icon: GraduationCap, label: user.school },
        user.website && { icon: Globe, label: user.website.replace(/^https?:\/\//, ""), href: user.website },
        user.githubProfile && {
            icon: Github,
            label: user.githubProfile,
            href: resolveSocialUrl(user.githubProfile, "https://github.com/"),
        },
        user.linkedinProfile && {
            icon: Linkedin,
            label: user.linkedinProfile,
            href: resolveSocialUrl(user.linkedinProfile, "https://linkedin.com/in/"),
        },
        user.twitterProfile && {
            icon: Twitter,
            label: user.twitterProfile,
            href: resolveSocialUrl(user.twitterProfile, "https://x.com/"),
        },
    ].filter(Boolean) as Array<{ icon: typeof MapPin; label: string; href?: string }>;

    return (
        <section className="rounded-lg border bg-card p-5 md:p-6" aria-label="Profile">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <Avatar className="size-16 shrink-0 border border-border-strong">
                        <AvatarImage
                            src={user.imgUrl || fallbackAvatar}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-1">
                        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                            {user.name || user.userId}
                        </h1>
                        <p className="truncate font-mono text-xs text-muted-foreground">@{user.userId}</p>
                        {user.headline && (
                            <p className="pt-1 text-sm leading-relaxed text-foreground/85">{user.headline}</p>
                        )}
                        {(rankTier || totalScore != null) && (
                            <p className="pt-1 text-xs text-muted-foreground">
                                {rankTier && <span className="font-medium text-foreground">{rankTier}</span>}
                                {totalScore != null && (
                                    <>
                                        {rankTier ? " · " : ""}
                                        Score {totalScore.toLocaleString()}
                                    </>
                                )}
                                {leaderboardPosition != null && (
                                    <> · Rank #{leaderboardPosition}</>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 gap-2">
                    <Button asChild size="sm">
                        <Link href="/problems">
                            Browse problems
                            <ArrowRight />
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/submissions">
                            <History />
                            Submissions
                        </Link>
                    </Button>
                </div>
            </div>

            {links.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
                    {links.map(({ icon: Icon, label, href }) => (
                        <li key={label} className="flex min-w-0 items-center gap-1.5">
                            <Icon className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden="true" />
                            {href ? (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate transition-colors hover:text-foreground hover:underline underline-offset-2"
                                >
                                    {label}
                                </a>
                            ) : (
                                <span className="truncate">{label}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
