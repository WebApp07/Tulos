#!/usr/bin/env node
// Dumps real Licendi catalog data (products, categories, existing posts)
// so the SEO agent can build valid internal links and avoid duplicate content.
//
// Usage: node --env-file=.env scripts/seo/list-catalog.mjs
// Output: JSON with { products, categories, posts }

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-12-15",
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN || undefined,
});

const PRODUCTS_QUERY = `*[_type == "product"]{ _id, name, "slug": slug.current, "categories": categories[]->{ title, "slug": slug.current }, "brandSlug": brandRef->slug.current } | order(name asc)`;
const CATEGORIES_QUERY = `*[_type == "category"]{ _id, title, "slug": slug.current, description, "brandSlug": brandRef->slug.current } | order(title asc)`;
const POSTS_QUERY = `*[_type == "post"]{ _id, title, "slug": slug.current, seoTitle, seoDescription, tags, publishedAt, "brandSlug": brandRef->slug.current } | order(publishedAt desc)`;
const BRANDS_QUERY = `*[_type == "brand"]{
  _id,
  title,
  "slug": slug.current,
  description,
  officialPartner,
  "productCount": count(*[_type == "product" && references(^._id)]),
  "postCount": count(*[_type == "post" && references(^._id)]),
  "categoryCount": count(*[_type == "category" && references(^._id)])
} | order(title asc)`;

try {
  const [products, categories, posts, brands] = await Promise.all([
    client.fetch(PRODUCTS_QUERY),
    client.fetch(CATEGORIES_QUERY),
    client.fetch(POSTS_QUERY),
    client.fetch(BRANDS_QUERY),
  ]);

  process.stdout.write(
    JSON.stringify(
      {
        products: products.map((p) => ({
          name: p.name,
          slug: p.slug,
          categories: p.categories?.map((c) => c.slug) ?? [],
          brand: p.brandSlug ?? null,
        })),
        categories: categories.map((c) => ({
          title: c.title,
          slug: c.slug,
          description: c.description ?? null,
          brand: c.brandSlug ?? null,
        })),
        posts: posts.map((p) => ({
          title: p.title,
          slug: p.slug,
          seoTitle: p.seoTitle ?? null,
          tags: p.tags ?? [],
          publishedAt: p.publishedAt ?? null,
          brand: p.brandSlug ?? null,
        })),
        brands: brands.map((b) => ({
          title: b.title,
          slug: b.slug,
          description: b.description ?? null,
          officialPartner: Boolean(b.officialPartner),
          productCount: b.productCount,
          postCount: b.postCount,
          categoryCount: b.categoryCount,
          contentEligible: b.productCount > 0,
        })),
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error("Failed to fetch catalog:", error.message);
  process.exit(1);
}