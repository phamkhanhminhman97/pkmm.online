import type { Locale } from "@/i18n/config";

const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", vi: "vi-VN" };

/** "2026-08-21" -> Date lúc 00:00 UTC. Không dùng new Date(s) trực tiếp:
 *  chuỗi chỉ có ngày bị hiểu là UTC, nhưng getDate() trả theo giờ máy build,
 *  nên ở múi giờ âm sẽ lùi mất một ngày. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Ngày hiển thị theo ngôn ngữ đang đọc: "21 Aug 2026" / "21 tháng 8, 2026". */
export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[lang], {
    day: "numeric",
    month: lang === "en" ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseISODate(iso));
}

/** Chỉ phần ngày + tháng, cho ô lịch nhỏ ở trang chủ. */
export function formatDayMonth(iso: string, lang: Locale): { day: string; month: string } {
  const date = parseISODate(iso);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(INTL_LOCALE[lang], { ...opts, timeZone: "UTC" }).format(date);
  return { day: fmt({ day: "numeric" }), month: fmt({ month: "short" }) };
}
