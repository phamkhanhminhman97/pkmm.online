import type { MetadataRoute } from "next";
import { SITE_URL as BASE_URL } from "@/lib/site";

export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
