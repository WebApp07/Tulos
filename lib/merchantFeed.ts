import "server-only";
import { unstable_cache } from "next/cache";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_URL } from "@/lib/site";

export const MERCHANT_FEED_TAG = "merchant-feed";

type FeedProduct = {
  _id: string;
  name?: string;
  slug?: { current?: string } | null;
  description?: string;
  intro?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  brandRefTitle?: string | null;
  brand?: string;
  brandName?: string;
  categorySlug?: string | null;
  categoryTitle?: string | null;
};

const FEED_PRODUCTS_QUERY = defineQuery(
  `*[_type == "product"]{
    _id,
    name,
    slug,
    description,
    intro,
    price,
    stock,
    "imageUrl": images[0].asset->url,
    "brandRefTitle": brandRef->title,
    brand,
    brandName,
    "categorySlug": categories[0]->slug.current,
    "categoryTitle": categories[0]->title
  } | order(_updatedAt desc)`,
);

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const GOOGLE_TAXONOMY = {
  "operating-systems": "Software > Computer Software > Operating Systems",
  "microsoft-office-pc-mac": "Software > Computer Software > Office Software",
} as const;

function googleProductCategory(slug?: string | null): string {
  if (slug && slug in GOOGLE_TAXONOMY) {
    return GOOGLE_TAXONOMY[slug as keyof typeof GOOGLE_TAXONOMY];
  }
  return "Software > Computer Software";
}

function resolveBrand(p: FeedProduct): string {
  return (
    p.brandRefTitle || p.brand?.trim() || p.brandName?.trim() || "Microsoft"
  );
}

function isEligible(p: FeedProduct): boolean {
  return Boolean(
    p._id &&
      p.name &&
      p.slug?.current &&
      p.price &&
      p.imageUrl &&
      (p.description || p.intro),
  );
}

function formatPrice(price: number): string {
  return `${price.toFixed(2)} USD`;
}

function productItem(p: FeedProduct): string {
  const slug = p.slug!.current!;
  const link = `${SITE_URL}/en/product/${slug}`;
  const image = p.imageUrl!;
  const availability = (p.stock ?? 0) > 0 ? "in_stock" : "out_of_stock";
  const title = p.name!;
  const description = p.description || p.intro || "";
  const brand = resolveBrand(p);
  const categorySlug = p.categorySlug ?? null;
  const productType = p.categoryTitle || googleProductCategory(categorySlug);

  return [
    "<item>",
    `<g:id>${escapeXml(p._id)}</g:id>`,
    `<g:title>${escapeXml(title)}</g:title>`,
    `<g:description>${escapeXml(description)}</g:description>`,
    `<link>${escapeXml(link)}</link>`,
    `<g:image_link>${escapeXml(image)}</g:image_link>`,
    `<g:price>${escapeXml(formatPrice(p.price!))}</g:price>`,
    `<g:availability>${availability}</g:availability>`,
    "<g:condition>new</g:condition>",
    `<g:brand>${escapeXml(brand)}</g:brand>`,
    "<g:identifier_exists>false</g:identifier_exists>",
    `<g:google_product_category>${escapeXml(
      googleProductCategory(categorySlug),
    )}</g:google_product_category>`,
    `<g:product_type>${escapeXml(productType)}</g:product_type>`,
    "</item>",
  ].join("\n");
}

function buildFeedXml(products: FeedProduct[]): string {
  const items = products.map(productItem).join("\n");
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">`,
    "<channel>",
    "<title>Licendi</title>",
    `<link>${escapeXml(SITE_URL)}</link>`,
    "<description>Official Microsoft software licensing store. Digital license keys delivered by email.</description>",
    items,
    "</channel>",
    "</rss>",
  ].join("\n");
}

const getFeedData = unstable_cache(
  async (): Promise<{ products: FeedProduct[] }> => {
    let products: FeedProduct[] = [];
    try {
      const result = await sanityFetch({
        query: FEED_PRODUCTS_QUERY,
      });
      products = (result?.data as FeedProduct[] | undefined) ?? [];
    } catch (error) {
      console.error("Merchant feed: failed to fetch Sanity products:", error);
    }
    return { products };
  },
  ["merchant-feed-data"],
  {
    revalidate: 900,
    tags: [MERCHANT_FEED_TAG, "sanity"],
  },
);

export async function buildMerchantFeed(): Promise<string> {
  const { products } = await getFeedData();
  const eligible = products.filter(isEligible);
  return buildFeedXml(eligible);
}