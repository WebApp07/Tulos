import Container from "@/components/Container";
import ProductInfo from "@/components/ProductInfo";
import { getProductBySlug } from "@/sanity/helpers/queries";
import { notFound } from "next/navigation";
import React from "react";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return notFound();
  }

  return (
    <Container className="py-10">
      <ProductInfo product={product} />
    </Container>
  );
};

export default SingleProductPage;
