"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Github, Twitter } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on problem pages where the editor takes full height
  if (pathname.startsWith("/problems/") && pathname.split("/").length > 2) {
    return null;
  }

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0 w-full px-4">
        {/* Footer content */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4" />
          <span>© 2024 AlgoCrack. All rights reserved.</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-foreground">About</Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

