import type { MetadataRoute } from "next";
import { getKnownPageSlugs } from "@/lib/cms";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const slugs = getKnownPageSlugs();

  return slugs.map((slug) => ({
    url: slug === "home" ? `${baseUrl}/` : `${baseUrl}/${slug}`,
    changeFrequency: "weekly",
    priority: slug === "home" ? 1 : 0.8,
  }));
}
