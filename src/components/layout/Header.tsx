"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store";
import { cn } from "@/lib/utils";
import { Code2, User, LogOut, Settings, Sun, Moon } from "lucide-react";
import { ProblemActions } from "@/components/problems/problem-actions";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";

const navLinks = [
  { href: "/problems", label: "Problems" },
  { href: "/submissions", label: "Submissions" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useUserStore();
  const { user, isAuthenticated, logout } = useAuth();
  const [profileImg, setProfileImg] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const fallbackAvatar = user?.userId
    ? `https://api.dicebear.com/7.x/notionists/svg?seed=${user.userId}&backgroundColor=e5e7eb`
    : "";

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    let cancelled = false;
    const loadProfileImage = async () => {
      try {
        const profile = await apiClient.get<{ userDetails?: { imgUrl?: string } }>(
          `/api/v1/user/profile/${encodeURIComponent(user.userId)}?page=0&size=1`
        );
        const img = profile?.userDetails?.imgUrl ?? null;
        if (!cancelled) setProfileImg(img);
      } catch {
        if (!cancelled) setProfileImg(null);
      }
    };

    void loadProfileImage();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.userId]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center w-full px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">AlgoCrack</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center Actions (Only for Problem Page) */}
        {pathname.startsWith("/problems/") && pathname.split("/").length > 2 && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
            <ProblemActions />
          </div>
        )}

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu or Sign In */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={profileImg || user?.imgUrl || fallbackAvatar}
                      alt={user?.email || "User"}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (fallbackAvatar && e.currentTarget.src !== fallbackAvatar) {
                          e.currentTarget.src = fallbackAvatar;
                        } else {
                          e.currentTarget.style.display = "none";
                        }
                      }}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href={`/auth/signin?next=${encodeURIComponent(pathname)}`}>Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
