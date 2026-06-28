/** Map backend WordPress links to Next.js application paths. */
export function normalizeWordPressHref(href: string): string {
  if (!href) return "/";

  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  if (href.startsWith("/") && !href.includes("/backend/")) {
    return href.replace(/\/+$/, "") || "/";
  }

  try {
    const url = new URL(href, "http://localhost");
    let path = url.pathname;

    // /thesibook-booking-shine/backend/business/ → /business
    path = path.replace(/^\/[^/]+\/backend(?=\/|$)/i, "");
    // /backend/business/ → /business (subfolder installs)
    path = path.replace(/^\/backend(?=\/|$)/i, "");
    path = path.replace(/\/index\.php$/i, "");
    path = path.replace(/\/+$/, "");

    return path === "" ? "/" : path;
  } catch {
    const stripped = href
      .replace(/https?:\/\/[^/]+/i, "")
      .replace(/^\/[^/]+\/backend/i, "")
      .replace(/^\/backend/i, "")
      .replace(/\/index\.php$/i, "")
      .replace(/\/+$/, "");

    return stripped === "" ? "/" : stripped;
  }
}
