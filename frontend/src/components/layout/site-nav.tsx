"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/settings";

type SiteNavProps = {
  navLinks: NavLink[];
  ctaLabel: string;
  ctaHref: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ navLinks, ctaLabel, ctaHref }: SiteNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              target={link.target}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(pathname, link.href) && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link href={ctaHref} className={buttonVariants({ className: "bg-gradient-brand text-primary-foreground" })}>
            {ctaLabel}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md p-2 text-foreground md:hidden"
          aria-label="Μενού"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-3 md:hidden">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={`${link.href}-mobile-${link.label}`}
                href={link.href}
                target={link.target}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  isActive(pathname, link.href) && "bg-muted text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href={ctaHref}
            onClick={() => setOpen(false)}
            className={buttonVariants({
              className: "mt-3 w-full bg-gradient-brand text-primary-foreground",
            })}
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </header>
  );
}
