"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/store";
import { cn } from "@/lib/utils";
import { User, LogOut, Sun, Moon, Menu, ListChecks, History } from "lucide-react";
import { ProblemActions } from "@/components/problems/problem-actions";
import { BrandMark, SHELL_CLASS } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { StreakBadge } from "./StreakBadge";

const navLinks = [
  { href: "/problems", label: "Problems", icon: ListChecks },
  { href: "/submissions", label: "Submissions", icon: History },
];

function isProblemWorkspace(pathname: string) {
  return (
    pathname.startsWith("/problems/") &&
    !pathname.startsWith("/problems/lists") &&
    pathname.split("/").length > 2
  );
}

/** Problem list and list views use a full-width three-column workspace. */
export function isProblemBrowser(pathname: string) {
  return pathname === "/problems" || pathname.startsWith("/problems/lists");
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useUserStore();
  const { user, isAuthenticated, logout } = useAuth();
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const inWorkspace = isProblemWorkspace(pathname);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/75">
      <div
        className={cn(
          "relative flex h-12 items-center gap-2",
          inWorkspace || isProblemBrowser(pathname) ? "w-full px-3 sm:px-4" : SHELL_CLASS
        )}
      >
        <Link
          href="/"
          className="mr-3 flex items-center rounded-md focus-visible:outline-offset-4"
          aria-label="AlgoCrack home"
        >
          <BrandMark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
                isActive(link.href)
                  ? "text-foreground after:absolute after:inset-x-2.5 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {inWorkspace && (
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <ProblemActions />
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {isAuthenticated && <StreakBadge />}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="sm:hidden" aria-label="Open navigation">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className={cn(isActive(link.href) && "text-primary")}>
                    <link.icon />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-8 rounded-full p-0"
                  aria-label="Account menu"
                >
                  <Avatar className="size-7 border border-border">
                    <AvatarImage
                      src={profileImg || user?.imgUrl || fallbackAvatar}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (fallbackAvatar && e.currentTarget.src !== fallbackAvatar) {
                          e.currentTarget.src = fallbackAvatar;
                        } else {
                          e.currentTarget.style.display = "none";
                        }
                      }}
                    />
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user?.name || user?.email}
                  </span>
                  {user?.name && (
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/submissions">
                    <History />
                    Submissions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={logout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-1">
              <Link href={`/auth/signin?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
