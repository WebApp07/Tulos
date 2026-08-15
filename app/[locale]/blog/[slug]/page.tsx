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
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

type PortableBlock = {
  _type?: string;
  style?: string;
  children?: { text?: string }[];
};

function extractFaq(blocks: PortableBlock[]): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  let inFaq = false;
  let current: { question: string; answer: string[] } | null = null;

  for (const block of blocks) {
    if (block._type !== "block") continue;
    const text = (block.children ?? [])
      .map((child) => child.text ?? "")
      .join(" ")
      .trim();

    if (block.style === "h2") {
      if (current) {
        faqs.push({
          question: current.question,
          answer: current.answer.join(" "),
        });
        current = null;
      }
      if (/faq/i.test(text)) {
        inFaq = true;
      } else {
        inFaq = false;
      }
      continue;
    }

    if (!inFaq) continue;

    if (block.style === "h3") {
      if (current) {
        faqs.push({
          question: current.question,
          answer: current.answer.join(" "),
        });
      }
      current = { question: text, answer: [] };
    } else if (current && text) {
      current.answer.push(text);
    }
  }

  if (current) {
    faqs.push({ question: current.question, answer: current.answer.join(" ") });
  }

  return faqs;
}

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

  const canonicalUrl = localizedUrl(locale, `/blog/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangAlternates(`/blog/${slug}`),
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: SITE_NAME,
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

  const canonicalUrl = localizedUrl(locale, `/blog/${slug}`);

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
      name: SITE_NAME,
      url: localizedUrl(locale, ""),
    },
    mainEntityOfPage: canonicalUrl,
    inLanguage: locale,
    keywords: post.tags?.join(", "),
  };

  const brandRef = (post as Post & {
    brandRef?: { title?: string; slug?: { current?: string } } | null;
  })?.brandRef;

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: localizedUrl(locale, ""),
    },
  ];

  if (brandRef?.slug?.current) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: brandRef.title || "Brand",
      item: localizedUrl(locale, `/brand/${brandRef.slug.current}`),
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: "Blog",
      item: localizedUrl(locale, "/blog"),
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 4,
      name: title || post.title || "",
      item: canonicalUrl,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: localizedUrl(locale, "/blog"),
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: title || post.title || "",
      item: canonicalUrl,
    });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const faqs = extractFaq(body as PortableBlock[]);
  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const recentPosts = await getLatestPosts(3, slug);

  return (
    <Container className="py-10 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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
        {brandRef?.slug?.current && (
          <div className="mb-4">
            <Link
              href={`/brand/${brandRef.slug.current}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-darkColor bg-lightBg px-3 py-1 rounded-full border border-darkColor/10 hover:border-darkColor/25 hoverEffect"
            >
              {brandRef.title || "Brand"}
            </Link>
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