import type { Metadata } from "next";
import { type Locale, href, OG_LOCALE, LOCALES } from "./config";
import { SITE_URL } from "@/lib/site";

/**
 * hreflang alternates for a page that exists in both locales.
 * `path` is the canonical path WITHOUT locale prefix, e.g. "/" or "/about".
 */
/**
 * @param availableIn Locale bản dịch THẬT SỰ tồn tại. Mặc định là tất cả.
 *   Khai hreflang cho một locale chưa dịch = tự tạo trang trùng nội dung.
 */
export function alternatesFor(
  lang: Locale,
  path: string,
  availableIn: readonly Locale[] = LOCALES,
): Metadata["alternates"] {
  const langs = availableIn.length > 1 ? availableIn : [];
  return {
    canonical: href(lang, path),
    languages: {
      ...Object.fromEntries(langs.map((l) => [l, href(l, path)])),
      ...(availableIn.includes("en") ? { "x-default": href("en", path) } : {}),
    },
    // Phải khai ở ĐÂY, không phải ở root layout: metadata của page thay thế
    // nguyên khối `alternates` của layout, nên link RSS đặt ở root sẽ biến mất.
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: "PKMM.ONLINE — Technical Blog" },
      ],
    },
  };
}

export function ogLocaleFor(lang: Locale) {
  return {
    locale: OG_LOCALE[lang],
    alternateLocale: LOCALES.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    url: `${SITE_URL}${href(lang, "/")}`,
  };
}
