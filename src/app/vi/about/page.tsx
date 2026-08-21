import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { getDictionary } from "@/i18n/dictionary";
import { alternatesFor, ogLocaleFor } from "@/i18n/metadata";

const LANG = "vi" as const;
const t = getDictionary(LANG).about;

export const metadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  alternates: alternatesFor(LANG, "/about"),
  openGraph: {
    type: "profile",
    title: t.metaTitle,
    description: t.metaDescription,
    ...ogLocaleFor(LANG),
  },
};

export default function Page() {
  return <AboutPage lang={LANG} />;
}
