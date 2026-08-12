import Container from "@/components/Container";
import ProductInfo from "@/components/ProductInfo";
import { getProductBySlug } from "@/sanity/helpers/queries";
import { translateProductField } from "@/lib/translate";
import { notFound } from "next/navigation";
import React from "react";

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

  return (
    <Container className="py-10">
      <ProductInfo product={localizedProduct} />
    </Container>
  );
};

export default SingleProductPage;
