export type NavLink = {
  label: string;
  href: string;
  target?: "_blank" | "_self";
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  email: string;
  address: string;
  mainNav: NavLink[];
  footerNav: NavLink[];
  legalNav: NavLink[];
  contactCtaLabel: string;
  contactCtaHref: string;
  logoSrc: string;
};
