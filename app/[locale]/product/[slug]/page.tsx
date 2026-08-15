import type { Metadata } from "next";
import Container from "@/components/Container";
import ProductInfo from "@/components/ProductInfo";
import { getProductBySlug } from "@/sanity/helpers/queries";
import { translateProductField } from "@/lib/translate";
import { urlFor } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import type { Product } from "@/sanity.types";
import React from "react";

type SingleProductPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({
  params,
}: SingleProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const isDefaultLocale = locale === "en";

  const name = isDefaultLocale
    ? product.name || ""
    : await translateProductField("name", product.name || "", locale);
  const intro = isDefaultLocale
    ? product.intro || product.description || ""
    : await translateProductField(
        "intro",
        product.intro || product.description || "",
        locale,
      );

  const url = localizedUrl(locale, `/product/${slug}`);

  return {
    title: name,
    description: intro,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(`/product/${slug}`),
    },
    openGraph: {
      title: `${name} | ${SITE_NAME}`,
      description: intro,
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
      images: product.images?.length
        ? [{ url: urlFor(product.images[0]).width(1200).url() }]
        : undefined,
    },
  };
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return notFound();
  }

  const isDefaultLocale = locale === "en";

  const localizedProduct = isDefaultLocale
    ? product
    : {
        ...product,
        name: await translateProductField("name", product.name || "", locale),
        description: await translateProductField(
          "description",
          product.description || "",
          locale,
        ),
        intro: await translateProductField("intro", product.intro || "", locale),
      };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedProduct.name,
    description:
      localizedProduct.description || localizedProduct.intro || undefined,
    image: localizedProduct.images?.length
      ? [urlFor(localizedProduct.images[0]).url()]
      : undefined,
    sku: localizedProduct.sku,
    brand: localizedProduct.brandRef
      ? {
          "@type": "Brand",
          name: localizedProduct.brandRef.title || localizedProduct.brandName,
          url: localizedProduct.brandRef.slug?.current
            ? localizedUrl(locale, `/brand/${localizedProduct.brandRef.slug.current}`)
            : undefined,
        }
      : localizedProduct.brandName
        ? { "@type": "Brand", name: localizedProduct.brandName }
        : undefined,
    offers: {
      "@type": "Offer",
      url: localizedUrl(locale, `/product/${slug}`),
      priceCurrency: "USD",
      price: localizedProduct.price,
      availability:
        (localizedProduct.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: localizedUrl(locale, ""),
    },
  ];

  if (localizedProduct.brandRef?.slug?.current) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name:
        localizedProduct.brandRef.title ||
        localizedProduct.brandName ||
        "Brand",
      item: localizedUrl(
        locale,
        `/brand/${localizedProduct.brandRef.slug.current}`,
      ),
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: localizedProduct.name || "",
      item: localizedUrl(locale, `/product/${slug}`),
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: localizedProduct.name || "",
      item: localizedUrl(locale, `/product/${slug}`),
    });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <Container className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductInfo product={localizedProduct as Product} />
    </Container>
  );
};

export default SingleProductPage;