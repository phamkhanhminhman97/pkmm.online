import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { npmPackages } from "@/data/projects";
import { SITE_URL as BASE_URL } from "@/lib/site";
import { LOCALES, href } from "@/i18n/config";

export const dynamic = "force-static";

/** Trang song ngữ -> khai hreflang cho cả hai bản. */
function bilingual(path: string, priority: number, changeFrequency: "weekly" | "monthly") {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `${BASE_URL}${href(l, path)}`]),
  );
  return LOCALES.map((l) => ({
    url: `${BASE_URL}${href(l, path)}`,
    lastModified: new Date(),
    changeFrequency,
    priority: l === "en" ? priority : priority - 0.1,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...bilingual("/", 1, "weekly"),
    ...bilingual("/about", 0.8, "monthly"),
    // Bài viết: chỉ khai những locale bài THẬT SỰ có bản dịch.
    // Bài chỉ có tiếng Việt mà khai cả /blog/... lẫn /vi/blog/... thì Google
    // thấy hai URL cùng nội dung -> tự chọn một, và có thể chọn sai.
    ...blogPosts.flatMap((post) => {
      const languages = Object.fromEntries(
        post.availableIn.map((l) => [l, `${BASE_URL}${href(l, `/blog/${post.slug}`)}`]),
      );
      return post.availableIn.map((l) => ({
        url: `${BASE_URL}${href(l, `/blog/${post.slug}`)}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: l === "en" ? 0.6 : 0.5,
        ...(post.availableIn.length > 1 ? { alternates: { languages } } : {}),
      }));
    }),
    ...npmPackages.map((pkg) => ({
      url: `${BASE_URL}/projects/${pkg.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
