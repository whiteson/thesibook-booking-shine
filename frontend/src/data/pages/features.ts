import { homePage } from "@/data/pages/home";
import type {
  FaqSection,
  IconGridSection,
  PageViewModel,
  SolutionSection,
} from "@/types/cms";

function getSection<T>(predicate: (section: (typeof homePage.sections)[number]) => boolean): T {
  return homePage.sections.find(predicate) as T;
}

export const featuresPage: PageViewModel = {
  slug: "features",
  title: "Λειτουργίες",
  seo: {
    title: "Λειτουργίες | ThesiBook",
    description:
      "Online κρατήσεις, διαχείριση θέσεων, ημερολόγιο, notifications και όλα όσα χρειάζεσαι για να γεμίσεις τις θέσεις σου.",
  },
  sections: [
    {
      type: "page_hero",
      title: "Λειτουργίες",
      description:
        "Όλα όσα χρειάζεσαι για να οργανώσεις και να γεμίσεις τα σεμινάριά σου.",
    },
    getSection<IconGridSection>(
      (section) => section.type === "icon_grid" && section.variant === "features",
    ),
    getSection<SolutionSection>((section) => section.type === "solution"),
    getSection<FaqSection>((section) => section.type === "faq"),
  ],
};
