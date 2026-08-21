import type { Locale } from "./config";

/** A value that exists in both languages. */
export type Localized<T> = Record<Locale, T>;

/** Pick the value for a locale. */
export function pick<T>(value: Localized<T>, lang: Locale): T {
  return value[lang];
}
