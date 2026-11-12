import type { MetadataRoute } from "next";
import { getKnownPageSlugs } from "@/lib/cms";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";
  const slugs = getKnownPageSlugs();

  const pages = slugs.map((slug) => ({
    url: slug === "home" ? `${baseUrl}/` : `${baseUrl}/${slug}`,
    changeFrequency: "weekly" as const,
    priority: slug === "home" ? 1 : 0.8,
  }));

  const extra = ["/privacy", "/terms", "/login", "/register", "/forgot-password"];

  return [
    ...pages,
    ...extra.map((path) => ({
      url: `${baseUrl}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
