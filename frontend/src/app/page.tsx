import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getPage, getCmsSettings } from "@/lib/cms";
import { yoastToMetadata } from "@/lib/seo/yoast";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return yoastToMetadata(page.seo);
}

export default async function HomePage() {
  const [settings, page] = await Promise.all([getCmsSettings(), getPage("home")]);

  return (
    <SiteShell settings={settings}>
      <SectionRenderer sections={page.sections} />
    </SiteShell>
  );
}
