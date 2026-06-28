import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import type { SiteSettings } from "@/types/settings";

type SiteFooterProps = {
  settings: SiteSettings;
};

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo className="h-9" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {settings.tagline}
            </p>
            <a
              href={`mailto:${settings.email}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-soft"
            >
              <Mail className="h-4 w-4" />
              {settings.email}
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold">Πλοήγηση</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {settings.footerNav.map((item) => (
                <li key={`footer-${item.href}-${item.label}`}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Νομικά</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {settings.legalNav.map((item) => (
                <li key={`legal-${item.href}-${item.label}`}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {settings.siteName}. Με αγάπη από την Ελλάδα.</p>
          <p>Κλείσε τη θέση σου εύκολα.</p>
        </div>
      </div>
    </footer>
  );
}
