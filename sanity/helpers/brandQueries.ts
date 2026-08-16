import { defineQuery } from "next-sanity";
import { sanityFetch } from "../lib/live";
import type { Brand, Category, Product, Post } from "@/sanity.types";

export type BrandSummary = Pick<
  Brand,
  "_id" | "title" | "slug" | "description" | "seoTitle" | "seoDescription" | "officialPartner" | "showPosts"
>;

export type BrandPage = BrandSummary & {
  logo?: Brand["logo"];
  categories?: Array<
    Pick<Category, "_id" | "title" | "slug" | "description"> & {
      productCount?: number;
    }
  >;
  products?: Array<Pick<Product, "_id" | "name" | "slug" | "intro" | "price" | "discount" | "images" | "stock">>;
  posts?: Array<
    Pick<
      Post,
      | "_id"
      | "title"
      | "slug"
      | "excerpt"
      | "coverImage"
      | "body"
      | "publishedAt"
      | "_createdAt"
      | "tags"
      | "featured"
    > & {
      author?: { _id?: string; name?: string } | null;
    }
  >;
};

const BRAND_PROJECTION = `{
  _id,
  title,
  slug,
  description,
  seoTitle,
  seoDescription,
  logo,
  officialPartner,
  showPosts,
  "categories": relatedCategories[]->{
    _id,
    title,
    slug,
    description,
    "productCount": count(*[_type == "product" && references(^._id)])
  },
  "products": *[_type == "product" && references(^._id)]{
    _id,
    name,
    slug,
    intro,
    price,
    discount,
    images,
    stock
  } | order(name asc),
  "posts": *[_type == "post" && references(^._id)] | order(publishedAt desc){
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    body,
    _createdAt,
    publishedAt,
    tags,
    featured,
    "author": author->{ _id, name }
  }
}`;

export const getBrandBySlug = async (slug: string): Promise<BrandPage | null> => {
  const BRAND_BY_SLUG_QUERY = defineQuery(
    `*[_type == "brand" && slug.current == $slug][0] ${BRAND_PROJECTION}`,
  );
  try {
    const brand = await sanityFetch({
      query: BRAND_BY_SLUG_QUERY,
      params: { slug },
    });
    return (brand?.data as BrandPage | null) || null;
  } catch (error) {
    console.error("Error fetching brand by slug:", error);
    return null;
  }
};

export const getAllBrands = async (): Promise<BrandSummary[]> => {
  const BRANDS_QUERY = defineQuery(
    `*[_type == "brand"]{ _id, title, slug, description, seoTitle, seoDescription, officialPartner } | order(title asc)`,
  );
  try {
    const brands = await sanityFetch({ query: BRANDS_QUERY });
    return (brands.data as BrandSummary[]) || [];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
};

// Only brands that actually have at least one real product are content-eligible.
export const getContentEligibleBrands = async (): Promise<BrandSummary[]> => {
  const ELIGIBLE_BRANDS_QUERY = defineQuery(
    `*[_type == "brand" && count(*[_type == "product" && references(^._id)]) > 0]{ _id, title, slug, description, seoTitle, seoDescription, officialPartner } | order(title asc)`,
  );
  try {
    const brands = await sanityFetch({ query: ELIGIBLE_BRANDS_QUERY });
    return (brands.data as BrandSummary[]) || [];
  } catch (error) {
    console.error("Error fetching content-eligible brands:", error);
    return [];
  }
};

// Sitemap helper: only brands with at least one real product get a brand page.
export const getAllBrandSlugsForSitemap = async (): Promise<
  Array<{ _id: string; slug?: string; _updatedAt?: string }>
> => {
  const BRAND_SITEMAP_QUERY = defineQuery(
    `*[_type == "brand" && count(*[_type == "product" && references(^._id)]) > 0]{ _id, "slug": slug.current, _updatedAt } | order(_updatedAt desc)`,
  );
  try {
    const brands = await sanityFetch({ query: BRAND_SITEMAP_QUERY });
    return (brands.data || []) as Array<{ _id: string; slug?: string; _updatedAt?: string }>;
  } catch (error) {
    console.error("Error fetching brand slugs for sitemap:", error);
    return [];
  }
};