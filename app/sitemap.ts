import { getAllCategories, getAllProducts } from "@/sanity/helpers/queries";
import { routing } from "@/i18n/routing";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://licendi.xyz";

const staticRoutes = [
  "",
  "/about",
  "/faqs",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/shipping-policy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAllProducts(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }

    for (const category of categories) {
      if (!category?.slug?.current) continue;
      entries.push({
        url: `${BASE_URL}/${locale}/category/${category.slug.current}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const product of products) {
      if (!product?.slug?.current) continue;
      entries.push({
        url: `${BASE_URL}/${locale}/product/${product.slug.current}`,
        lastModified: product._updatedAt
          ? new Date(product._updatedAt)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
