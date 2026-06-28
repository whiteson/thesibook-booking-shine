import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getCmsSettings, getKnownPageSlugs, getPage } from "@/lib/cms";
import { yoastToMetadata } from "@/lib/seo/yoast";

type Props = {
  params: Promise<{ slug: string }>;
};

const INNER_PAGE_SLUGS = getKnownPageSlugs().filter((slug) => slug !== "home");

export async function generateStaticParams() {
  return INNER_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!INNER_PAGE_SLUGS.includes(slug)) {
    return {
      title: "Σελίδα δεν βρέθηκε | ThesiBook",
    };
  }
  const page = await getPage(slug);
  return yoastToMetadata(page.seo);
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  if (!INNER_PAGE_SLUGS.includes(slug)) {
    notFound();
  }

  const [settings, page] = await Promise.all([getCmsSettings(), getPage(slug)]);

  return (
    <SiteShell settings={settings}>
      <SectionRenderer sections={page.sections} />
    </SiteShell>
  );
}
