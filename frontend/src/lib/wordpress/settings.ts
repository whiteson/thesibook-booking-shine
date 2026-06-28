import { wpSettingsFetchInit } from "@/lib/render-mode";
import { normalizeWordPressHref } from "@/lib/wordpress/normalize-link";
import type { NavLink, SiteSettings } from "@/types/settings";

const API_BASE =
  process.env.WORDPRESS_API_URL ??
  "http://localhost/thesibook-booking-shine/backend/wp-json/webcode/v1";

type WpSettingsPayload = {
  settings?: Record<string, unknown> | unknown[];
};

export const defaultMainNav: NavLink[] = [
  { label: "Αρχική", href: "/" },
  { label: "Για επιχειρήσεις", href: "/business" },
  { label: "Πώς λειτουργεί", href: "/how-it-works" },
  { label: "Λειτουργίες", href: "/features" },
  { label: "Επικοινωνία", href: "/contact" },
];

export const defaultSiteSettings: SiteSettings = {
  siteName: "ThesiBook",
  tagline:
    "Η νέα πλατφόρμα κρατήσεων για εκπαιδευτικές επιχειρήσεις στην Ελλάδα.",
  email: "hello@thesibook.gr",
  address: "Αθήνα, Ελλάδα",
  mainNav: defaultMainNav,
  footerNav: [
    { label: "Αρχική", href: "/" },
    { label: "Για επιχειρήσεις", href: "/business" },
    { label: "Λειτουργίες", href: "/features" },
    { label: "Επικοινωνία", href: "/contact" },
  ],
  legalNav: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
  ],
  contactCtaLabel: "Ζήτησε early access",
  contactCtaHref: "/contact",
  logoSrc: "/thesibook-logo.svg",
};

function asString(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  return value.trim();
}

function parseNav(value: unknown): NavLink[] {
  if (!Array.isArray(value)) return [];

  const parsed = value.map((item): NavLink | null => {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const label = asString(row.label);
    const href = asString(row.href);
    if (!label || !href) return null;

    const target = row.target === "_blank" ? "_blank" : undefined;

    return {
      label,
      href: normalizeWordPressHref(href),
      ...(target ? { target } : {}),
    };
  });

  return parsed.filter((item): item is NavLink => item !== null);
}

function normalizeSettings(raw: Record<string, unknown>): SiteSettings {
  const mainNav = parseNav(raw.main_nav);
  const footerNav = parseNav(raw.footer_nav);
  const legalNav = parseNav(raw.legal_nav);

  return {
    siteName: asString(raw.site_name) ?? defaultSiteSettings.siteName,
    tagline: asString(raw.footer_tagline) ?? defaultSiteSettings.tagline,
    email: asString(raw.email) ?? defaultSiteSettings.email,
    address: asString(raw.address) ?? defaultSiteSettings.address,
    mainNav: mainNav.length > 0 ? mainNav : defaultSiteSettings.mainNav,
    footerNav: footerNav.length > 0 ? footerNav : defaultSiteSettings.footerNav,
    legalNav: legalNav.length > 0 ? legalNav : defaultSiteSettings.legalNav,
    contactCtaLabel:
      asString(raw.contact_cta_label) ?? defaultSiteSettings.contactCtaLabel,
    contactCtaHref:
      asString(raw.contact_cta_href) ?? defaultSiteSettings.contactCtaHref,
    logoSrc: asString(raw.logo_src) ?? defaultSiteSettings.logoSrc,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const url = `${API_BASE.replace(/\/$/, "")}/settings`;

  try {
    const response = await fetch(url, wpSettingsFetchInit());
    if (!response.ok) return defaultSiteSettings;

    const payload = (await response.json()) as WpSettingsPayload;
    if (
      !payload.settings ||
      Array.isArray(payload.settings) ||
      typeof payload.settings !== "object"
    ) {
      return defaultSiteSettings;
    }

    return normalizeSettings(payload.settings as Record<string, unknown>);
  } catch {
    return defaultSiteSettings;
  }
}
