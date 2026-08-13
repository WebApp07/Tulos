import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import {
  getLatestPosts,
  getPostBySlug,
} from "@/sanity/helpers/blogQueries";
import { translatePortableText, translateText } from "@/lib/translate";
import { urlFor } from "@/sanity/lib/image";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, UserRound } from "lucide-react";
import { calculateReadingTime, formatBlogDate } from "@/lib/blog";
import BlogPortableText from "@/components/blog/PortableText";
import BlogAuthor from "@/components/blog/BlogAuthor";
import BlogShare from "@/components/blog/BlogShare";
import BlogCard from "@/components/blog/BlogCard";
import type { Post } from "@/sanity.types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://licendi.xyz";

type BlogPostPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const isDefaultLocale = locale === "en";
  const fallbackTitle = post.seoTitle || post.title || "";
  const fallbackDescription = post.seoDescription || post.excerpt || "";

  const [title, description] = isDefaultLocale
    ? [fallbackTitle, fallbackDescription]
    : await Promise.all([
        translateText(fallbackTitle, locale),
        translateText(fallbackDescription, locale),
      ]);

  const cover = post.coverImage
    ? urlFor(post.coverImage).width(1200).url()
    : undefined;

  const canonicalUrl = `${BASE_URL}/${locale}/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "Licendi",
      locale,
      images: cover ? [{ url: cover, width: 1200, height: 630 }] : undefined,
      publishedTime: post.publishedAt || post._createdAt,
      modifiedTime: post._updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("blog");
  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const isDefaultLocale = locale === "en";

  const [title, excerpt, body] = isDefaultLocale
    ? [post.title, post.excerpt, post.body]
    : await Promise.all([
        translateText(post.title || "", locale),
        translateText(post.excerpt || "", locale),
        translatePortableText(post.body || [], locale),
      ]);

  const cover = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(675).url()
    : undefined;

  const canonicalUrl = `${BASE_URL}/${locale}/blog/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt || undefined,
    image: cover ? [cover] : undefined,
    datePublished: post.publishedAt || post._createdAt,
    dateModified: post._updatedAt,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Licendi",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: canonicalUrl,
    inLanguage: locale,
    keywords: post.tags?.join(", "),
  };

  const recentPosts = await getLatestPosts(3, slug);

  return (
    <Container className="py-10 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-lightColor hover:text-darkColor hoverEffect mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToBlog")}
      </Link>

      <header className="mb-8">
        {post?.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-lightBg text-darkColor border-transparent"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-darkColor leading-tight mb-4">
          {title}
        </h1>
        {excerpt && (
          <p className="text-lg text-lightColor leading-relaxed mb-6">
            {excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
          {post?.author?.name && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-darkColor">
              <UserRound className="w-4 h-4" />
              {post.author.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatBlogDate(post?.publishedAt || post?._createdAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {calculateReadingTime(post?.body || [])} {t("minRead")}
          </span>
        </div>
      </header>

      {cover && (
        <Image
          src={cover}
          width={1200}
          height={675}
          alt={title || "Blog post cover"}
          priority
          className="w-full h-auto max-h-[560px] object-cover rounded-2xl border border-darkColor/10 mb-10"
        />
      )}

      <article className="prose-none">
        <BlogPortableText
          value={body as NonNullable<Post["body"]>}
        />
      </article>

      <div className="border-t border-zinc-200 mt-12 pt-8 mb-12">
        <BlogShare title={title} url={canonicalUrl} />
      </div>

      {post?.author && <BlogAuthor author={post.author} />}

      {recentPosts.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-darkColor mb-6">
            {t("recentPosts")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((recent) => (
              <BlogCard key={recent._id} post={recent} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}