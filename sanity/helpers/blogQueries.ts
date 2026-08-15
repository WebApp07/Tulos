import { defineQuery } from "next-sanity";
import { sanityFetch } from "../lib/live";
import type { Author, Post } from "@/sanity.types";

export type BlogPost = Omit<Post, "author"> & {
  author?: Author | null;
};

const POST_PROJECTION = `{
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  excerpt,
  coverImage,
  body,
  publishedAt,
  featured,
  tags,
  seoTitle,
  seoDescription,
  "author": author->{
    _id,
    name,
    role,
    bio,
    slug,
    image
  },
  "brandRef": brandRef->{
    _id,
    title,
    slug
  }
}`;

export const getAllPosts = async (): Promise<BlogPost[]> => {
  const POSTS_QUERY = defineQuery(
    `*[_type == "post"] | order(publishedAt desc) ${POST_PROJECTION}`,
  );
  try {
    const posts = await sanityFetch({ query: POSTS_QUERY });
    return (posts.data as BlogPost[]) || [];
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
};

export const getPostBySlug = async (
  slug: string,
): Promise<BlogPost | null> => {
  const POST_BY_SLUG_QUERY = defineQuery(
    `*[_type == "post" && slug.current == $slug][0] ${POST_PROJECTION}`,
  );
  try {
    const post = await sanityFetch({
      query: POST_BY_SLUG_QUERY,
      params: { slug },
    });
    return (post?.data as BlogPost | null) || null;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
};

export const getLatestPosts = async (
  limit = 3,
  excludeSlug?: string,
): Promise<BlogPost[]> => {
  const LATEST_POSTS_QUERY = defineQuery(
    `*[_type == "post" && (!defined($excludeSlug) || slug.current != $excludeSlug)] | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      slug,
      excerpt,
      coverImage,
      publishedAt,
      featured,
      tags,
      "author": author->{
        _id,
        name,
        role,
        slug,
        image
      }
    }`,
  );
  try {
    const posts = await sanityFetch({
      query: LATEST_POSTS_QUERY,
      params: { limit, excludeSlug: excludeSlug || null },
    });
    return (posts.data as BlogPost[]) || [];
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
};
