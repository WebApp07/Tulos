import { Product } from "@/sanity.types";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const ProductCharacteristics = ({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant?: {
    color?: string;
    size?: string;
    variantSku?: string;
    stock?: number;
    price?: number;
  };
}) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>{product?.name}: Characteristics</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1">
          <p className="flex items-center justify-between">
            Brand:{" "}
            <span className="font-semibold tracking-wide">
              {product?.brand || "Unknown"}
            </span>
          </p>
          <p className="flex items-center justify-between">
            Collection:{" "}
            <span className="font-semibold tracking-wide">2024</span>
          </p>
          <p className="flex items-center justify-between">
            Type:{" "}
            <span className="font-semibold tracking-wide capitalize">
              {product?.productType}
            </span>
          </p>
          <p className="flex items-center justify-between">
            SKU:{" "}
            <span className="font-semibold tracking-wide uppercase">
              {selectedVariant?.variantSku || product?.sku || "N/A"}
            </span>
          </p>
          {selectedVariant?.color && (
            <p className="flex items-center justify-between">
              Color:{" "}
              <span className="font-semibold tracking-wide capitalize">
                {selectedVariant.color}
              </span>
            </p>
          )}
          {selectedVariant?.size && (
            <p className="flex items-center justify-between">
              Size:{" "}
              <span className="font-semibold tracking-wide uppercase">
                {selectedVariant.size}
              </span>
            </p>
          )}
          <p className="flex items-center justify-between">
            Stock:{" "}
            <span className="font-semibold tracking-wide">
              {selectedVariant ? (selectedVariant.stock ? "Available" : "Out of Stock") : (product?.stock ? "Available" : "Out of Stock")}
            </span>
          </p>
          <p className="flex items-center justify-between">
            Intro:{" "}
            <span className="font-semibold tracking-wide">
              {product?.intro}
            </span>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;
