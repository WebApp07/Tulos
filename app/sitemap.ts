import { getAllCategories, getAllProducts } from "@/sanity/helpers/queries";
import { getAllPosts } from "@/sanity/helpers/blogQueries";
import { getAllBrandSlugsForSitemap } from "@/sanity/helpers/brandQueries";
import { routing } from "@/i18n/routing";
import { localizedUrl, hreflangAlternates } from "@/lib/site";
import type { MetadataRoute } from "next";

export const revalidate = 600;

const staticRoutes = [
  "",
  "/about",
  "/faqs",
  "/contact",
  "/blog",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/shipping-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts, brands] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
    getAllPosts(),
    getAllBrandSlugsForSitemap(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: localizedUrl(locale, route),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.8,
        alternates: { languages: hreflangAlternates(route) },
      });
    }

    for (const category of categories) {
      if (!category?.slug?.current) continue;
      const route = `/category/${category.slug.current}`;
      entries.push({
        url: localizedUrl(locale, route),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages: hreflangAlternates(route) },
      });
    }

    for (const brand of brands) {
      if (!brand?.slug) continue;
      const route = `/brand/${brand.slug}`;
      entries.push({
        url: localizedUrl(locale, route),
        lastModified: brand._updatedAt ? new Date(brand._updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: hreflangAlternates(route) },
      });
    }

    for (const product of products) {
      if (!product?.slug?.current) continue;
      const route = `/product/${product.slug.current}`;
      entries.push({
        url: localizedUrl(locale, route),
        lastModified: product._updatedAt
          ? new Date(product._updatedAt)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: { languages: hreflangAlternates(route) },
      });
    }

    for (const post of posts) {
      if (!post?.slug?.current) continue;
      const route = `/blog/${post.slug.current}`;
      entries.push({
        url: localizedUrl(locale, route),
        lastModified: post._updatedAt ? new Date(post._updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: hreflangAlternates(route) },
      });
    }
  }

  return entries;
}