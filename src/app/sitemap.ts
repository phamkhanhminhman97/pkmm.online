import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { npmPackages } from "@/data/projects";

export const dynamic = "force-static";

const BASE_URL = "https://pkmm.online";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  // Blog posts
  const blogPages = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Project detail pages
  const projectPages = npmPackages.map((pkg) => ({
    url: `${BASE_URL}/projects/${pkg.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...projectPages];
}
