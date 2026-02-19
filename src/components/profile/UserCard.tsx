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
        <div className="space-y-4 p-4">
            {/* Identity Section */}
            <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border border-border">
                    <AvatarImage src={user.imgUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.userId}&backgroundColor=e5e7eb`} alt={user.name} />
                    <AvatarFallback className="text-lg font-semibold bg-muted text-muted-foreground">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 pt-1">
                    <h1 className="text-lg font-semibold truncate text-foreground leading-tight">
                        {user.name || user.userId}
                    </h1>
                    <p className="text-xs text-muted-foreground mb-1">@{user.userId}</p>

                    {user.rank && (
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span>Rank <span className="text-foreground font-medium">#{Number(user.rank).toLocaleString()}</span></span>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm h-8 text-xs font-medium">
                Edit Profile
            </Button>

            <Separator className="bg-border/40" />

            {/* Info Links */}
            <div className="space-y-2 text-xs">
                {user.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{user.location}</span>
                    </div>
                )}
                {user.school && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{user.school}</span>
                    </div>
                )}
                {user.website && (
                    <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate hover:underline underline-offset-2">{user.website}</span>
                    </a>
                )}
                {user.githubProfile && (
                    <a
                        href={`https://github.com/${user.githubProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Github className="h-3.5 w-3.5 shrink-0" />
                        <span>{user.githubProfile}</span>
                    </a>
                )}
                {user.linkedinProfile && (
                    <a
                        href={`https://linkedin.com/in/${user.linkedinProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Linkedin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{user.linkedinProfile}</span>
                    </a>
                )}
                {user.twitterProfile && (
                    <a
                        href={`https://twitter.com/${user.twitterProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Twitter className="h-3.5 w-3.5 shrink-0" />
                        <span>{user.twitterProfile}</span>
                    </a>
                )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
                <>
                    <Separator className="bg-border/40" />
                    <div>
                        <h3 className="text-xs font-semibold text-foreground mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="px-2 py-0 h-5 text-[10px] font-medium bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border-transparent transition-colors rounded-full"
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
                    <Separator className="bg-border/40" />
                    <div>
                        <div className="space-y-1.5">
                            {languageStats.map((lang) => (
                                <div
                                    key={lang.language}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <span className="text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                        {lang.language}
                                    </span>
                                    <span className="text-muted-foreground">
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
