import { getAllMockSlugs, getMockPage } from "@/data/pages";
import { getSiteSettings } from "@/lib/wordpress/settings";
import { getHomePage, getPageBySlug, WordPressApiError } from "@/lib/wordpress";
import type { PageViewModel } from "@/types/cms";

function hasRenderableSections(page: PageViewModel): boolean {
  if (page.sections.length === 0) return false;
  return page.sections.some((section) => section.type !== "unknown");
}

export async function getPage(slug: string): Promise<PageViewModel> {
  const normalizedSlug =
    slug === "" || slug === "/" || slug === "home" ? "home" : slug;
  const mock = getMockPage(normalizedSlug);

  try {
    const page =
      normalizedSlug === "home"
        ? await getHomePage()
        : await getPageBySlug(normalizedSlug);

    if (!hasRenderableSections(page) && mock) {
      return mock;
    }

    return page;
  } catch (error) {
    if (mock && error instanceof WordPressApiError) {
      return mock;
    }
    if (mock) {
      return mock;
    }
    throw error;
  }
}

export async function getCmsSettings() {
  return getSiteSettings();
}

export function getKnownPageSlugs(): string[] {
  return getAllMockSlugs();
}
