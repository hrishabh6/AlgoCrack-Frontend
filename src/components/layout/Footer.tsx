"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Container } from "@/components/shared";

const footerLinks = [
  { href: "/problems", label: "Problems" },
  { href: "/submissions", label: "Submissions" },
  { href: "/profile", label: "Profile" },
];

export function Footer() {
  const pathname = usePathname();

  // Hide footer on problem pages where the editor takes full height
  if (
    pathname.startsWith("/problems/") &&
    !pathname.startsWith("/problems/lists") &&
    pathname.split("/").length > 2
  ) {
    return null;
  }

  return (
    <footer className="border-t">
      <Container className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <BrandMark showWordmark={false} className="opacity-80" />
          <span>© {new Date().getFullYear()} AlgoCrack</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-5 text-xs text-muted-foreground">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
