import type { YoastHeadJson } from "@/lib/seo/types";

export type LinkField = {
  label: string;
  href: string;
  target?: "_blank" | "_self";
};

export type IconCard = {
  icon: string;
  title: string;
  description?: string;
};

export type PageHeroSection = {
  type: "page_hero";
  eyebrow?: string;
  title: string;
  description?: string;
};

export type HeroSection = {
  type: "hero";
  badge: string;
  title: string;
  highlightedText: string;
  description: string;
  primaryCta: LinkField;
  secondaryCta?: LinkField;
  trustBullets: IconCard[];
  dashboardTitle: string;
  dashboardSubtitle: string;
  dashboardAvatarLabel: string;
  stats: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  featuredEvent: {
    title: string;
    meta: string;
    seatsLabel: string;
    totalSeats: number;
    takenIndexes: number[];
    selectedIndex: number;
    selectedSeatLabel: string;
    priceLabel: string;
  };
  floatingCard: {
    icon: string;
    label: string;
    title: string;
  };
};

export type IconGridSection = {
  type: "icon_grid";
  variant: "problem" | "features" | "benefits";
  eyebrow: string;
  title: string;
  description?: string;
  items: IconCard[];
};

export type SolutionSection = {
  type: "solution";
  eyebrow: string;
  title: string;
  highlightedText: string;
  description: string;
  bullets: string[];
  weekdays: string[];
  calendar: {
    totalCells: number;
    startOffset: number;
    monthDays: number;
    activeDay: number;
    availableDays: number[];
  };
  events: Array<{
    title: string;
    schedule: string;
    occupancy: string;
  }>;
};

export type ForBusinessesSection = {
  type: "for_businesses";
  eyebrow: string;
  title: string;
  description: string;
  businessTypes: string[];
  cta: LinkField;
};

export type StepsSection = {
  type: "steps";
  eyebrow: string;
  title: string;
  steps: Array<{
    number: string;
    title: string;
    description: string;
  }>;
};

export type AppPreviewSection = {
  type: "app_preview";
  eyebrow: string;
  title: string;
  description: string;
  discover: {
    brand: string;
    searchPlaceholder: string;
    categories: string[];
    cards: Array<{
      title: string;
      location: string;
      seats: string;
    }>;
  };
  details: {
    topBarLabel: string;
    title: string;
    subtitle: string;
    description: string;
    speakerLabel: string;
    speakerValue: string;
    ctaLabel: string;
  };
  seatPicker: {
    topBarLabel: string;
    totalSeats: number;
    takenIndexes: number[];
    selectedIndex: number;
    availableLabel: string;
    takenLabel: string;
    selectedLabel: string;
    selectedSeat: string;
    priceLabel: string;
    price: string;
    ctaLabel: string;
  };
};

export type EarlyAccessSection = {
  type: "early_access";
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  businessTypes: string[];
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    businessTypeLabel: string;
    businessTypePlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
  };
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  errorDescription: string;
};

export type FaqSection = {
  type: "faq";
  eyebrow: string;
  title: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
};

export type ContactCardsSection = {
  type: "contact_cards";
  cards: Array<{
    icon: string;
    title: string;
    value: string;
    href: string;
  }>;
};

export type UnknownSection = {
  type: "unknown";
  layoutType: string;
  payload?: Record<string, unknown>;
};

export type PageSection =
  | PageHeroSection
  | HeroSection
  | IconGridSection
  | SolutionSection
  | ForBusinessesSection
  | StepsSection
  | AppPreviewSection
  | EarlyAccessSection
  | FaqSection
  | ContactCardsSection
  | UnknownSection;

export type PageSeo = {
  title: string;
  description: string;
  yoast?: YoastHeadJson | null;
  yoastHead?: string | null;
};

export type PageViewModel = {
  slug: string;
  title: string;
  seo: PageSeo;
  sections: PageSection[];
};
