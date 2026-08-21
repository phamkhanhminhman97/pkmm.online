import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { getDictionary } from "@/i18n/dictionary";
import { alternatesFor, ogLocaleFor } from "@/i18n/metadata";

const LANG = "vi" as const;
const t = getDictionary(LANG).home;

export const metadata: Metadata = {
  title: { absolute: t.metaTitle },
  description: t.metaDescription,
  alternates: alternatesFor(LANG, "/"),
  openGraph: {
    title: t.metaTitle,
    description: t.metaDescription,
    ...ogLocaleFor(LANG),
  },
};

export default function Page() {
  return <HomePage lang={LANG} />;
}
