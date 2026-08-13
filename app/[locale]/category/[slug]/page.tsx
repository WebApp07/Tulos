import type { Metadata } from "next";
import CategoryProducts from "@/components/CategoryProducts";
import Container from "@/components/Container";
import { getAllCategories } from "@/sanity/helpers/queries";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import React from "react";

type CategoryPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug?.current === slug);
  if (!category) return {};

  const title = category.title || slug;
  const description = category.description || undefined;

  const url = localizedUrl(locale, `/category/${slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(`/category/${slug}`),
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
    },
  };
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug, locale } = await params;
  const categories = await getAllCategories();
  const category = categories.find((c) => c.slug?.current === slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: localizedUrl(locale, ""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category?.title || slug,
        item: localizedUrl(locale, `/category/${slug}`),
      },
    ],
  };

  return (
    <Container className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="text-xl font-semibold">
        {category?.title || slug}
      </h1>
      {category?.description && (
        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
      )}
      <CategoryProducts categories={categories} slug={slug} />
    </Container>
  );
};

export default CategoryPage;