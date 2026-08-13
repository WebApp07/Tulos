import Container from "@/components/Container";
import ProductInfo from "@/components/ProductInfo";
import { getProductBySlug } from "@/sanity/helpers/queries";
import { translateProductField } from "@/lib/translate";
import { urlFor } from "@/sanity/lib/image";
import { notFound } from "next/navigation";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://licendi.xyz";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) => {
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
    brand: localizedProduct.brandName
      ? { "@type": "Brand", name: localizedProduct.brandName }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/${locale}/product/${slug}`,
      priceCurrency: "USD",
      price: localizedProduct.price,
      availability:
        (localizedProduct.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Container className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductInfo product={localizedProduct} />
    </Container>
  );
};

export default SingleProductPage;
