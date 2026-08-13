"use client";

import { Link } from "@/i18n/navigation";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateReadingTime, formatBlogDate } from "@/lib/blog";
import type { BlogPost } from "@/sanity/helpers/blogQueries";

interface BlogCardProps {
  post: BlogPost;
  priority?: boolean;
}

const BlogCard = ({ post, priority = false }: BlogCardProps) => {
  const t = useTranslations("blog");
  const locale = useLocale();

  return (
    <article className="group flex flex-col rounded-xl overflow-hidden bg-white border border-zinc-200 hoverEffect hover:shadow-lg hover:border-darkColor/20">
      <Link
        href={`/blog/${post?.slug?.current}`}
        className="relative block overflow-hidden bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200"
      >
        {post?.coverImage && (
          <Image
            src={urlFor(post.coverImage).width(800).height(480).url()}
            width={800}
            height={480}
            alt={post?.title || "Blog post cover"}
            className="w-full h-56 object-cover group-hover:scale-105 hoverEffect"
            priority={priority}
          />
        )}
      </Link>
      <div className="p-5 flex flex-col gap-3 flex-1">
        {post?.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
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
        <h3 className="text-lg font-bold text-darkColor leading-snug line-clamp-2">
          <Link
            href={`/blog/${post?.slug?.current}`}
            className="hover:text-gray-700 hoverEffect"
          >
            {post?.title}
          </Link>
        </h3>
        {post?.excerpt && (
          <p className="text-sm text-lightColor leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-zinc-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatBlogDate(
                post?.publishedAt || post?._createdAt,
                locale,
              )}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {calculateReadingTime(post?.body || [])} {t("minRead")}
            </span>
          </div>
          <Link
            href={`/blog/${post?.slug?.current}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-darkColor hover:text-gray-700 hoverEffect shrink-0"
          >
            {t("readArticle")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 hoverEffect" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;