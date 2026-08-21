/**
 * Bilingual site. English is the DEFAULT and lives at the root (`/`, `/about`, …).
 * Vietnamese is prefixed (`/vi`, `/vi/about`, …).
 *
 * Static export cannot run Proxy/middleware, so there is no automatic
 * Accept-Language redirect — the switcher in the header is the only entry point.
 * See node_modules/next/dist/docs/01-app/02-guides/static-exports.md (unsupported features).
 */
export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** `en` -> "", `vi` -> "/vi". Prepend to every internal href. */
export function localePrefix(lang: Locale): string {
  return lang === DEFAULT_LOCALE ? "" : `/${lang}`;
}

/** Build an internal href for a locale: href("vi", "/about") -> "/vi/about" */
export function href(lang: Locale, path: string): string {
  const p = path === "/" ? "" : path;
  return `${localePrefix(lang)}${p}` || "/";
}

export const HTML_LANG: Record<Locale, string> = { en: "en", vi: "vi" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", vi: "vi_VN" };
export const LOCALE_LABEL: Record<Locale, string> = { en: "EN", vi: "VI" };
