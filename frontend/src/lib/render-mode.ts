/**
 * Rendering strategy for App Router pages and WordPress fetches.
 *
 * NEXT_RENDER_MODE:
 *   isr (default) - SSG at build + ISR
 *   ssr           - Server renders each request
 *   static        - Fully static at build
 */

export type RenderMode = "isr" | "ssr" | "static";

export function getRenderMode(): RenderMode {
  const raw = process.env.NEXT_RENDER_MODE?.trim().toLowerCase();
  if (raw === "ssr") return "ssr";
  if (raw === "static") return "static";
  return "isr";
}

export const pageDynamic =
  getRenderMode() === "ssr" ? ("force-dynamic" as const) : undefined;

export const pageRevalidate: number | false =
  getRenderMode() === "isr"
    ? 60
    : getRenderMode() === "static"
      ? false
      : 0;

export function wpFetchInit(): RequestInit {
  const mode = getRenderMode();
  if (mode === "ssr") {
    return { cache: "no-store" };
  }
  if (mode === "static") {
    return { cache: "force-cache" };
  }
  return { next: { revalidate: 60 } };
}

export function wpSettingsFetchInit(): RequestInit {
  const mode = getRenderMode();
  if (mode === "ssr") {
    return { cache: "no-store" };
  }
  if (mode === "static") {
    return { cache: "force-cache" };
  }
  return { next: { revalidate: 300 } };
}
