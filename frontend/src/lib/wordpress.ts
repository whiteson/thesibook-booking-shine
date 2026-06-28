import { wpFetchInit } from "@/lib/render-mode";
import { normalizeSection } from "@/lib/wordpress/normalize-section";
import type { WpRawSection } from "@/lib/wordpress/normalize-section";
import type { PageViewModel } from "@/types/cms";

const API_BASE =
  process.env.WORDPRESS_API_URL ??
  "http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1";

export class WordPressApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "WordPressApiError";
    this.status = status;
  }
}

type WpSeoResponse = {
  title?: string;
  description?: string;
  yoast?: PageViewModel["seo"]["yoast"];
  yoast_head?: string | null;
};

type WpPageResponse = {
  id: number;
  slug: string;
  title: string;
  seo?: WpSeoResponse;
  sections?: WpRawSection[] | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, wpFetchInit());

  if (!response.ok) {
    let message = `WordPress API error (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      /* ignore invalid JSON body */
    }
    throw new WordPressApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

function toPageViewModel(payload: WpPageResponse): PageViewModel {
  return {
    slug: payload.slug,
    title: payload.title,
    seo: {
      title: payload.seo?.title ?? payload.title,
      description: payload.seo?.description ?? "",
      yoast: payload.seo?.yoast ?? null,
      yoastHead: payload.seo?.yoast_head ?? null,
    },
    sections: (payload.sections ?? []).map((section) => normalizeSection(section)),
  };
}

export async function getHomePage(): Promise<PageViewModel> {
  const response = await fetchJson<WpPageResponse>("/home");
  return toPageViewModel(response);
}

export async function getPageBySlug(slug: string): Promise<PageViewModel> {
  const response = await fetchJson<WpPageResponse>(
    `/pages/${encodeURIComponent(slug)}`,
  );
  return toPageViewModel(response);
}
