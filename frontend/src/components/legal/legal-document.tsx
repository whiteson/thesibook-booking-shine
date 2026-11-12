import { SiteShell } from "@/components/layout/site-shell";
import { getCmsSettings } from "@/lib/cms";
import type { ReactNode } from "react";

type LegalDocumentProps = {
  title: string;
  children: ReactNode;
};

export async function LegalDocument({ title, children }: LegalDocumentProps) {
  const settings = await getCmsSettings();

  return (
    <SiteShell settings={settings}>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </article>
    </SiteShell>
  );
}
