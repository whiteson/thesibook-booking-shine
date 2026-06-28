import type {
  AppPreviewSection,
  ContactCardsSection,
  EarlyAccessSection,
  FaqSection,
  ForBusinessesSection,
  HeroSection,
  IconGridSection,
  PageHeroSection,
  PageSection,
  SolutionSection,
  StepsSection,
} from "@/types/cms";
import { normalizeWordPressHref } from "@/lib/wordpress/normalize-link";

export type WpRawSection = {
  type: string;
  [key: string]: unknown;
};

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item))
    .filter((item): item is string => Boolean(item));
}

function asObjectArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object",
  );
}

function pick(raw: WpRawSection, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function normalizePageHero(raw: WpRawSection): PageHeroSection {
  return {
    type: "page_hero",
    eyebrow: asString(pick(raw, "eyebrow")),
    title: asString(pick(raw, "title")) ?? "",
    description: asString(pick(raw, "description")),
  };
}

function normalizeHero(raw: WpRawSection): HeroSection {
  const trustBullets = asObjectArray(pick(raw, "trust_bullets")).map((item) => ({
    icon: asString(item.icon) ?? "CheckCircle2",
    title: asString(item.title) ?? "",
  }));

  const stats = asObjectArray(pick(raw, "stats")).map((item) => ({
    icon: asString(item.icon) ?? "Calendar",
    label: asString(item.label) ?? "",
    value: asString(item.value) ?? "",
  }));

  const event = (pick(raw, "featured_event") ?? {}) as Record<string, unknown>;
  const floatingCard = (pick(raw, "floating_card") ?? {}) as Record<
    string,
    unknown
  >;
  const primary = (pick(raw, "primary_cta") ?? {}) as Record<string, unknown>;
  const secondary = (pick(raw, "secondary_cta") ?? {}) as Record<
    string,
    unknown
  >;

  return {
    type: "hero",
    badge: asString(pick(raw, "badge")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    highlightedText: asString(pick(raw, "highlighted_text")) ?? "",
    description: asString(pick(raw, "description")) ?? "",
    primaryCta: {
      label: asString(primary.label) ?? "",
      href: normalizeWordPressHref(asString(primary.href) ?? "/"),
      target: primary.target === "_blank" ? "_blank" : "_self",
    },
    secondaryCta: {
      label: asString(secondary.label) ?? "",
      href: normalizeWordPressHref(asString(secondary.href) ?? "/"),
      target: secondary.target === "_blank" ? "_blank" : "_self",
    },
    trustBullets,
    dashboardTitle: asString(pick(raw, "dashboard_title")) ?? "",
    dashboardSubtitle: asString(pick(raw, "dashboard_subtitle")) ?? "",
    dashboardAvatarLabel: asString(pick(raw, "dashboard_avatar_label")) ?? "",
    stats,
    featuredEvent: {
      title: asString(event.title) ?? "",
      meta: asString(event.meta) ?? "",
      seatsLabel: asString(event.seats_label) ?? "",
      totalSeats: Number(event.total_seats ?? 24),
      takenIndexes: Array.isArray(event.taken_indexes)
        ? event.taken_indexes.map(Number).filter((value) => !Number.isNaN(value))
        : [],
      selectedIndex: Number(event.selected_index ?? 0),
      selectedSeatLabel: asString(event.selected_seat_label) ?? "",
      priceLabel: asString(event.price_label) ?? "",
    },
    floatingCard: {
      icon: asString(floatingCard.icon) ?? "CheckCircle2",
      label: asString(floatingCard.label) ?? "",
      title: asString(floatingCard.title) ?? "",
    },
  };
}

function normalizeIconGrid(raw: WpRawSection): IconGridSection {
  const items = asObjectArray(pick(raw, "items")).map((item) => ({
    icon: asString(item.icon) ?? "Sparkles",
    title: asString(item.title) ?? "",
    description: asString(item.description),
  }));

  const variant = asString(pick(raw, "variant"));

  return {
    type: "icon_grid",
    variant:
      variant === "problem" || variant === "benefits" ? variant : "features",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    description: asString(pick(raw, "description")),
    items,
  };
}

function normalizeSolution(raw: WpRawSection): SolutionSection {
  const calendar = (pick(raw, "calendar") ?? {}) as Record<string, unknown>;
  const events = asObjectArray(pick(raw, "events")).map((item) => ({
    title: asString(item.title) ?? "",
    schedule: asString(item.schedule) ?? "",
    occupancy: asString(item.occupancy) ?? "",
  }));

  return {
    type: "solution",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    highlightedText: asString(pick(raw, "highlighted_text")) ?? "",
    description: asString(pick(raw, "description")) ?? "",
    bullets: asStringArray(pick(raw, "bullets")),
    weekdays: asStringArray(pick(raw, "weekdays")),
    calendar: {
      totalCells: Number(calendar.total_cells ?? 35),
      startOffset: Number(calendar.start_offset ?? 0),
      monthDays: Number(calendar.month_days ?? 31),
      activeDay: Number(calendar.active_day ?? 1),
      availableDays: Array.isArray(calendar.available_days)
        ? calendar.available_days
            .map(Number)
            .filter((value) => !Number.isNaN(value))
        : [],
    },
    events,
  };
}

function normalizeForBusinesses(raw: WpRawSection): ForBusinessesSection {
  const cta = (pick(raw, "cta") ?? {}) as Record<string, unknown>;

  return {
    type: "for_businesses",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    description: asString(pick(raw, "description")) ?? "",
    businessTypes: asStringArray(pick(raw, "business_types")),
    cta: {
      label: asString(cta.label) ?? "",
      href: normalizeWordPressHref(asString(cta.href) ?? "/contact"),
      target: cta.target === "_blank" ? "_blank" : "_self",
    },
  };
}

function normalizeSteps(raw: WpRawSection): StepsSection {
  const steps = asObjectArray(pick(raw, "steps")).map((item, index) => ({
    number: asString(item.number) ?? String(index + 1).padStart(2, "0"),
    title: asString(item.title) ?? "",
    description: asString(item.description) ?? "",
  }));

  return {
    type: "steps",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    steps,
  };
}

function normalizeAppPreview(raw: WpRawSection): AppPreviewSection {
  const discover = (pick(raw, "discover") ?? {}) as Record<string, unknown>;
  const details = (pick(raw, "details") ?? {}) as Record<string, unknown>;
  const seatPicker = (pick(raw, "seat_picker") ?? {}) as Record<string, unknown>;

  return {
    type: "app_preview",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    description: asString(pick(raw, "description")) ?? "",
    discover: {
      brand: asString(discover.brand) ?? "",
      searchPlaceholder: asString(discover.searchPlaceholder) ?? "",
      categories: asStringArray(discover.categories),
      cards: asObjectArray(discover.cards).map((item) => ({
        title: asString(item.title) ?? "",
        location: asString(item.location) ?? "",
        seats: asString(item.seats) ?? "",
      })),
    },
    details: {
      topBarLabel: asString(details.topBarLabel) ?? "",
      title: asString(details.title) ?? "",
      subtitle: asString(details.subtitle) ?? "",
      description: asString(details.description) ?? "",
      speakerLabel: asString(details.speakerLabel) ?? "",
      speakerValue: asString(details.speakerValue) ?? "",
      ctaLabel: asString(details.ctaLabel) ?? "",
    },
    seatPicker: {
      topBarLabel: asString(seatPicker.topBarLabel) ?? "",
      totalSeats: Number(seatPicker.totalSeats ?? 30),
      takenIndexes: Array.isArray(seatPicker.takenIndexes)
        ? seatPicker.takenIndexes
            .map(Number)
            .filter((value) => !Number.isNaN(value))
        : [],
      selectedIndex: Number(seatPicker.selectedIndex ?? 0),
      availableLabel: asString(seatPicker.availableLabel) ?? "",
      takenLabel: asString(seatPicker.takenLabel) ?? "",
      selectedLabel: asString(seatPicker.selectedLabel) ?? "",
      selectedSeat: asString(seatPicker.selectedSeat) ?? "",
      priceLabel: asString(seatPicker.priceLabel) ?? "",
      price: asString(seatPicker.price) ?? "",
      ctaLabel: asString(seatPicker.ctaLabel) ?? "",
    },
  };
}

function normalizeEarlyAccess(raw: WpRawSection): EarlyAccessSection {
  const form = (pick(raw, "form") ?? {}) as Record<string, unknown>;

  return {
    type: "early_access",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    description: asString(pick(raw, "description")) ?? "",
    benefits: asStringArray(pick(raw, "benefits")),
    businessTypes: asStringArray(pick(raw, "business_types")),
    form: {
      nameLabel: asString(form.nameLabel) ?? "",
      namePlaceholder: asString(form.namePlaceholder) ?? "",
      emailLabel: asString(form.emailLabel) ?? "",
      emailPlaceholder: asString(form.emailPlaceholder) ?? "",
      phoneLabel: asString(form.phoneLabel) ?? "",
      phonePlaceholder: asString(form.phonePlaceholder) ?? "",
      companyLabel: asString(form.companyLabel) ?? "",
      companyPlaceholder: asString(form.companyPlaceholder) ?? "",
      businessTypeLabel: asString(form.businessTypeLabel) ?? "",
      businessTypePlaceholder: asString(form.businessTypePlaceholder) ?? "",
      messageLabel: asString(form.messageLabel) ?? "",
      messagePlaceholder: asString(form.messagePlaceholder) ?? "",
    },
    submitLabel: asString(pick(raw, "submit_label")) ?? "",
    successTitle: asString(pick(raw, "success_title")) ?? "",
    successDescription: asString(pick(raw, "success_description")) ?? "",
    errorDescription: asString(pick(raw, "error_description")) ?? "",
  };
}

function normalizeFaq(raw: WpRawSection): FaqSection {
  const items = asObjectArray(pick(raw, "items")).map((item) => ({
    question: asString(item.question) ?? "",
    answer: asString(item.answer) ?? "",
  }));

  return {
    type: "faq",
    eyebrow: asString(pick(raw, "eyebrow")) ?? "",
    title: asString(pick(raw, "title")) ?? "",
    items,
  };
}

function normalizeContactCards(raw: WpRawSection): ContactCardsSection {
  const cards = asObjectArray(pick(raw, "cards")).map((item) => ({
    icon: asString(item.icon) ?? "Mail",
    title: asString(item.title) ?? "",
    value: asString(item.value) ?? "",
    href: normalizeWordPressHref(asString(item.href) ?? "#"),
  }));

  return {
    type: "contact_cards",
    cards,
  };
}

export function normalizeSection(raw: WpRawSection): PageSection {
  switch (raw.type) {
    case "page_hero":
      return normalizePageHero(raw);
    case "hero":
      return normalizeHero(raw);
    case "icon_grid":
      return normalizeIconGrid(raw);
    case "solution":
      return normalizeSolution(raw);
    case "for_businesses":
      return normalizeForBusinesses(raw);
    case "steps":
      return normalizeSteps(raw);
    case "app_preview":
      return normalizeAppPreview(raw);
    case "early_access":
      return normalizeEarlyAccess(raw);
    case "faq":
      return normalizeFaq(raw);
    case "contact_cards":
      return normalizeContactCards(raw);
    default:
      return {
        type: "unknown",
        layoutType: raw.type,
        payload: raw,
      };
  }
}
