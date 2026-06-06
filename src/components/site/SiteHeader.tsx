import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#top", label: "Αρχική" },
  { href: "#business", label: "Για επιχειρήσεις" },
  { href: "#how", label: "Πώς λειτουργεί" },
  { href: "#features", label: "Λειτουργίες" },
  { href: "#contact", label: "Επικοινωνία" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center" aria-label="ThesiBook">
          <Logo className="h-8 md:h-9" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild className="bg-gradient-brand text-primary-foreground shadow-soft hover:opacity-95">
            <a href="#early-access">Ζήτησε early access</a>
          </Button>
        </div>
        <button
          className="md:hidden rounded-md p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Μενού"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
            <Button asChild className="mt-2 w-full bg-gradient-brand text-primary-foreground">
              <a href="#early-access" onClick={() => setOpen(false)}>Ζήτησε early access</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
