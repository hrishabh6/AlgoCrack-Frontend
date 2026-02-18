import { UserDetails, LanguageStat } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    GraduationCap,
    Globe,
    Github,
    Twitter,
    Linkedin,
    Pencil,
    Trophy,
    Flame,
} from "lucide-react";

interface UserCardProps {
    user: UserDetails;
    languageStats: LanguageStat[];
}

export function UserCard({ user, languageStats }: UserCardProps) {
    const skills = user.skills
        ? user.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const initials = user.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    return (
        <div className="space-y-6">
            {/* Identity Section */}
            <div className="flex items-start gap-5">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20 shadow-xl">
                        <AvatarImage src={user.imgUrl} alt={user.name} />
                        <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Online Indicator (Fake) */}
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                </div>

                <div className="flex-1 min-w-0 pt-2">
                    <h1 className="text-2xl font-bold truncate text-foreground tracking-tight">
                        {user.name || user.userId}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mb-2">@{user.userId}</p>

                    {user.rank && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-500 font-medium">
                            <Trophy className="h-3 w-3" />
                            <span>Rank #{Number(user.rank).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Streak & Badges (New Premium Features) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between group cursor-default transition-all hover:bg-orange-500/15">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <Flame className="h-6 w-6 fill-current" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-orange-500">4 Day Streak</div>
                            <div className="text-xs text-muted-foreground">Keep it up!</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Headline */}
            {user.headline && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm text-muted-foreground italic">
                    "{user.headline}"
                </div>
            )}

            <div className="flex gap-2">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(88,166,255,0.3)]">
                    Edit Profile
                </Button>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Globe className="h-4 w-4" />
                </Button>
            </div>

            <Separator className="bg-border/50" />

            {/* Info Links */}
            <div className="space-y-3 text-sm">
                {user.location && (
                    <div className="flex items-center gap-3 text-muted-foreground group">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        <span>{user.location}</span>
                    </div>
                )}
                {user.school && (
                    <div className="flex items-center gap-3 text-muted-foreground group">
                        <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        <span className="truncate">{user.school}</span>
                    </div>
                )}
                {user.website && (
                    <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <Globe className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        <span className="truncate hover:underline decoration-primary/50 underline-offset-4">{user.website}</span>
                    </a>
                )}
                {user.githubProfile && (
                    <a
                        href={`https://github.com/${user.githubProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <Github className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        <span>{user.githubProfile}</span>
                    </a>
                )}
                {user.twitterProfile && (
                    <a
                        href={`https://twitter.com/${user.twitterProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <Twitter className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        <span>{user.twitterProfile}</span>
                    </a>
                )}
                {user.linkedinProfile && (
                    <a
                        href={`https://linkedin.com/in/${user.linkedinProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <Linkedin className="h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        <span className="truncate">{user.linkedinProfile}</span>
                    </a>
                )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <>
                    <Separator className="bg-border/50" />
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="px-2.5 py-0.5 text-xs font-medium bg-secondary/50 hover:bg-secondary hover:text-foreground transition-colors cursor-default border-transparent hover:border-border"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Languages */}
            {languageStats.length > 0 && (
                <>
                    <Separator className="bg-border/50" />
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Languages</h3>
                        <div className="space-y-2">
                            {languageStats.map((lang) => (
                                <div
                                    key={lang.language}
                                    className="flex items-center justify-between text-sm group"
                                >
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-mono bg-transparent border-muted group-hover:border-primary/50 transition-colors"
                                    >
                                        {lang.language}
                                    </Badge>
                                    <span className="text-muted-foreground text-xs">
                                        <span className="text-foreground font-medium">{lang.problemsSolved}</span> solved
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
