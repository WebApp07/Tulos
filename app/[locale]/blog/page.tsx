import type { Metadata } from "next";
import Container from "@/components/Container";
import { getAllPosts } from "@/sanity/helpers/blogQueries";
import { getTranslations } from "next-intl/server";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { calculateReadingTime, formatBlogDate } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";
import type { Locale } from "@/i18n/routing";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "blog",
  });

  const url = localizedUrl(locale, "/blog");

  return {
    title: { absolute: t("title") },
    description: t("description"),
    alternates: {
      canonical: url,
      languages: hreflangAlternates("/blog"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");
  const posts = await getAllPosts();

  const featured = posts.find((post) => post.featured) || posts[0];
  const rest = posts.filter((post) => post._id !== featured?._id);

  return (
    <Container className="py-12 lg:px-8">
      <section className="text-center mb-14">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-darkColor bg-lightBg px-4 py-1.5 rounded-full border border-darkColor/10 mb-5">
          <Newspaper className="w-4 h-4" />
          {t("title")}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-darkColor mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-lightColor leading-relaxed max-w-2xl mx-auto">
          {t("description")}
        </p>
      </section>

      {featured && (
        <section className="mb-16">
          <Link
            href={`/blog/${featured?.slug?.current}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-6 bg-lightBg rounded-2xl overflow-hidden border border-darkColor/10 hover:border-darkColor/25 hoverEffect"
          >
            <div className="relative overflow-hidden min-h-72 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200">
              {featured?.coverImage && (
                <Image
                  src={urlFor(featured.coverImage)
                    .width(1000)
                    .height(600)
                    .url()}
                  width={1000}
                  height={600}
                  alt={featured?.title || "Featured post"}
                  priority
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 hoverEffect"
                />
              )}
            </div>
            <div className="p-8 flex flex-col justify-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-darkColor text-white border-transparent">
                  {t("featured")}
                </Badge>
                {featured?.tags?.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white text-darkColor border-transparent"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-darkColor leading-snug line-clamp-3 group-hover:text-gray-700 hoverEffect">
                {featured?.title}
              </h2>
              {featured?.excerpt && (
                <p className="text-lightColor leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {featured?.author?.name && (
                  <span className="font-semibold text-darkColor">
                    {featured.author.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatBlogDate(
                    featured?.publishedAt || featured?._createdAt,
                    locale,
                  )}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {calculateReadingTime(featured?.body || [])} {t("minRead")}
                </span>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-darkColor">
                {t("readArticle")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 hoverEffect" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-darkColor mb-6">
          {t("latestPosts")}
        </h2>
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-lightColor bg-lightBg rounded-xl p-8 text-center">
            {t("noPosts")}
          </p>
        )}
      </section>
    </Container>
  );
}