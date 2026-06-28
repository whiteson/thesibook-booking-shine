import { homePage } from "@/data/pages/home";
import type {
  AppPreviewSection,
  EarlyAccessSection,
  PageViewModel,
  StepsSection,
} from "@/types/cms";

function getSection<T>(predicate: (section: (typeof homePage.sections)[number]) => boolean): T {
  return homePage.sections.find(predicate) as T;
}

export const howItWorksPage: PageViewModel = {
  slug: "how-it-works",
  title: "Πώς λειτουργεί",
  seo: {
    title: "Πώς λειτουργεί | ThesiBook",
    description:
      "Δες σε 3 βήματα πώς το ThesiBook μετατρέπει τις κρατήσεις σου σε μια εύκολη online εμπειρία.",
  },
  sections: [
    {
      type: "page_hero",
      title: "Πώς λειτουργεί",
      description: "Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 απλά βήματα.",
    },
    getSection<StepsSection>((section) => section.type === "steps"),
    getSection<AppPreviewSection>((section) => section.type === "app_preview"),
    getSection<EarlyAccessSection>((section) => section.type === "early_access"),
  ],
};
