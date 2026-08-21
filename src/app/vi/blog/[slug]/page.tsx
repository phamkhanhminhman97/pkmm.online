import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import { blogPosts } from "@/data/blog";
import { alternatesFor, ogLocaleFor } from "@/i18n/metadata";

const LANG = "vi" as const;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Not found" };

  // Bài chưa dịch sang LANG: trang vẫn tồn tại (người đọc bấm từ trang chủ
  // vẫn tới nơi), nhưng trỏ canonical về bản CÓ nội dung và không cho index —
  // nếu không, Google thấy hai URL cùng một bài tiếng Việt.
  const translated = post.availableIn.includes(LANG);
  const canonicalLang = translated ? LANG : post.availableIn[0];

  return {
    title: post.title[LANG],
    description: post.description[LANG],
    alternates: alternatesFor(canonicalLang, `/blog/${post.slug}`, post.availableIn),
    ...(translated ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "article",
      title: post.title[LANG],
      description: post.description[LANG],
      ...ogLocaleFor(LANG),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();
  return <BlogArticle post={post} lang={LANG} />;
}
