import { homePage } from "@/data/pages/home";
import type {
  EarlyAccessSection,
  ForBusinessesSection,
  IconGridSection,
  PageViewModel,
} from "@/types/cms";

function getSection<T>(predicate: (section: (typeof homePage.sections)[number]) => boolean): T {
  return homePage.sections.find(predicate) as T;
}

export const businessPage: PageViewModel = {
  slug: "business",
  title: "Για επιχειρήσεις",
  seo: {
    title: "Για επιχειρήσεις | ThesiBook",
    description:
      "Το ThesiBook είναι σχεδιασμένο για εκπαιδευτικές επιχειρήσεις, ακαδημίες, coaches, studios και διοργανωτές σεμιναρίων στην Ελλάδα.",
  },
  sections: [
    {
      type: "page_hero",
      title: "Για επιχειρήσεις",
      description:
        "Μια πλατφόρμα φτιαγμένη για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.",
    },
    getSection<ForBusinessesSection>((section) => section.type === "for_businesses"),
    getSection<IconGridSection>(
      (section) => section.type === "icon_grid" && section.variant === "benefits",
    ),
    getSection<EarlyAccessSection>((section) => section.type === "early_access"),
  ],
};
