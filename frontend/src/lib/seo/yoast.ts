import type { Metadata } from "next";
import type { PageSeo } from "@/types/cms";

function firstOgImage(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0] as { url?: string } | undefined;
    return first?.url;
  }
  if (typeof value === "object" && "url" in value) {
    return (value as { url?: string }).url;
  }
  return undefined;
}

export function yoastToMetadata(seo: PageSeo): Metadata {
  const yoast = seo.yoast ?? undefined;
  const ogImage = firstOgImage(yoast?.og_image);

  return {
    title: yoast?.title ?? seo.title,
    description: yoast?.description ?? seo.description,
    ...(yoast?.canonical
      ? {
          alternates: {
            canonical: yoast.canonical,
          },
        }
      : {}),
    openGraph: {
      title: yoast?.og_title ?? seo.title,
      description: yoast?.og_description ?? seo.description,
      type: (yoast?.og_type as "website" | "article" | undefined) ?? "website",
      ...(yoast?.og_url ? { url: yoast.og_url } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card:
        (yoast?.twitter_card as
          | "summary"
          | "summary_large_image"
          | "app"
          | "player"
          | undefined) ?? "summary_large_image",
      title: yoast?.twitter_title ?? yoast?.og_title ?? seo.title,
      description:
        yoast?.twitter_description ?? yoast?.og_description ?? seo.description,
      ...(yoast?.twitter_image ? { images: [yoast.twitter_image] } : {}),
    },
  };
}
