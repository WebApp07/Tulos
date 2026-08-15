import { defineQuery } from "next-sanity";
import { sanityFetch } from "../lib/live";
import type { Product } from "@/sanity.types";

export type ResolvedBrand = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  description?: string;
  officialPartner?: boolean;
};

export type ProductWithBrand = Omit<Product, "brandRef"> & {
  brandRef?: ResolvedBrand | null;
};

export const getProductBySlug = async (
  slug: string,
): Promise<ProductWithBrand | null | undefined> => {
  const PRODUCT_BY_SLUG_QUERY = defineQuery(
    `*[_type == 'product' && slug.current == $slug] | order(name asc) [0]{
      ...,
      "brandRef": brandRef->{
        _id,
        title,
        slug,
        description,
        officialPartner
      }
    }`,
  );
  try {
    const product = await sanityFetch({
      query: PRODUCT_BY_SLUG_QUERY,
      params: {
        slug,
      },
    });
    return product?.data as ProductWithBrand | null | undefined;
  } catch (error) {
    console.error("Error fetching product by Slug:", error);
  }
};

export const getAllCategories = async () => {
  const CATEGORIES_QUERY = defineQuery(
    `*[_type=="category"] | order(title asc)`,
  );
  try {
    const categories = await sanityFetch({
      query: CATEGORIES_QUERY,
    });
    return categories.data || [];
  } catch (error) {
    console.error("Error fetching all categories");

    return [];
  }
};

export type CategoryWithBrand = {
  _id: string;
  title?: string | null;
  slug?: { current?: string } | null;
  description?: string | null;
  image?: unknown;
  brandRef?: { _id: string; title?: string | null; slug?: { current?: string } | null } | null;
};

export const getCategoryBySlug = async (slug: string) => {
  const CATEGORY_BY_SLUG_QUERY = defineQuery(
    `*[_type=="category" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      image,
      "brandRef": brandRef->{ _id, title, slug }
    }`,
  );
  try {
    const category = await sanityFetch({
      query: CATEGORY_BY_SLUG_QUERY,
      params: { slug },
    });
    return (category?.data as CategoryWithBrand | null) || null;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
};

export const getAllProducts = async () => {
  const PRODUCTS_QUERY = defineQuery(
    `*[_type=="product"]{slug,_updatedAt} | order(_updatedAt desc)`,
  );
  try {
    const products = await sanityFetch({
      query: PRODUCTS_QUERY,
    });
    return products.data || [];
  } catch (error) {
    console.error("Error fetching all products");
    return [];
  }
};

export const getMyOrders = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const MY_ORDERS_QUERY =
    defineQuery(`*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
    ...,
    paymentMethod,
    receiptUrl,
    products[]{
      ...,product->
    }
  }`);

  try {
    const orders = await sanityFetch({
      query: MY_ORDERS_QUERY,
      params: { userId },
    });
    return orders?.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const getOrderByNumber = async (orderNumber: string) => {
  if (!orderNumber) {
    throw new Error("Order number is required");
  }
  const ORDER_BY_NUMBER_QUERY =
    defineQuery(`*[_type == 'order' && orderNumber == $orderNumber][0]{
    ...,products[]{
      ...,product->
    }
  }`);

  try {
    const order = await sanityFetch({
      query: ORDER_BY_NUMBER_QUERY,
      params: { orderNumber },
    });
    return order?.data || null;
  } catch (error) {
    console.error("Error fetching order by number:", error);
    return null;
  }
};
