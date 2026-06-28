import { businessPage } from "@/data/pages/business";
import { contactPage } from "@/data/pages/contact";
import { featuresPage } from "@/data/pages/features";
import { homePage } from "@/data/pages/home";
import { howItWorksPage } from "@/data/pages/how-it-works";
import type { PageViewModel } from "@/types/cms";

const PAGES: Record<string, PageViewModel> = {
  home: homePage,
  business: businessPage,
  "how-it-works": howItWorksPage,
  features: featuresPage,
  contact: contactPage,
};

export function getMockPage(slug: string): PageViewModel | null {
  const key = slug === "" || slug === "/" ? "home" : slug;
  return PAGES[key] ?? null;
}

export function getAllMockSlugs(): string[] {
  return Object.keys(PAGES);
}

export const allMockPages = PAGES;
