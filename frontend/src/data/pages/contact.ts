import { homePage } from "@/data/pages/home";
import type { EarlyAccessSection, PageViewModel } from "@/types/cms";

function getSection<T>(predicate: (section: (typeof homePage.sections)[number]) => boolean): T {
  return homePage.sections.find(predicate) as T;
}

export const contactPage: PageViewModel = {
  slug: "contact",
  title: "Επικοινωνία",
  seo: {
    title: "Επικοινωνία | ThesiBook",
    description:
      "Επικοινώνησε με την ομάδα του ThesiBook για early access, συνεργασίες ή ερωτήσεις.",
  },
  sections: [
    {
      type: "page_hero",
      title: "Επικοινωνία",
      description:
        "Πες μας περισσότερα για την επιχείρησή σου και θα σου απαντήσουμε σύντομα.",
    },
    {
      type: "contact_cards",
      cards: [
        {
          icon: "Mail",
          title: "Email",
          value: "hello@thesibook.gr",
          href: "mailto:hello@thesibook.gr",
        },
        {
          icon: "MessageCircle",
          title: "Support",
          value: "Συνήθως απαντάμε σε 24 ώρες",
          href: "#",
        },
        {
          icon: "MapPin",
          title: "Έδρα",
          value: "Αθήνα, Ελλάδα",
          href: "#",
        },
      ],
    },
    getSection<EarlyAccessSection>((section) => section.type === "early_access"),
  ],
};
