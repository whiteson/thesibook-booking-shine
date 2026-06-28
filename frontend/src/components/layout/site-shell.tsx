import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import type { SiteSettings } from "@/types/settings";

type SiteShellProps = {
  settings: SiteSettings;
  children: ReactNode;
};

export function SiteShell({ settings, children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav
        navLinks={settings.mainNav}
        ctaHref={settings.contactCtaHref}
        ctaLabel={settings.contactCtaLabel}
      />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
