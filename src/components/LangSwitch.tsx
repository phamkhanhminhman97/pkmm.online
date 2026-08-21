import Link from "next/link";
import { type Locale, href, LOCALE_LABEL } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

/**
 * Static export cannot redirect by Accept-Language, so this is the ONLY way
 * a visitor reaches the other language. Keep it visible on every page.
 */
export default function LangSwitch({
  lang,
  path = "/",
}: {
  lang: Locale;
  /** Same page in the other locale, e.g. "/about". */
  path?: string;
}) {
  const other: Locale = lang === "en" ? "vi" : "en";
  const d = getDictionary(lang);

  return (
    <Link
      href={href(other, path)}
      hrefLang={other}
      aria-label={d.nav.switchLabel}
      title={d.nav.switchLabel}
      className="font-mono text-[11px] font-bold tracking-wider text-zinc-600 border border-zinc-300 rounded px-2 py-1 hover:border-black hover:text-black transition-colors whitespace-nowrap"
    >
      {LOCALE_LABEL[lang]} <span className="text-zinc-400">/</span>{" "}
      <span className="text-zinc-400">{LOCALE_LABEL[other]}</span>
    </Link>
  );
}
