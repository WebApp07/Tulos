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
              {product?.brandName || product?.brand || "Unknown"}
            </span>
          </p>
          <p className="flex items-center justify-between">
            Collection:{" "}
            <span className="font-semibold tracking-wide">2024</span>
          </p>
          <p className="flex items-center justify-between">
            Type:{" "}
            <span className="font-semibold tracking-wide capitalize">
              {product?.osType || product?.productType}
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
          {product?.operatingSystemsSupported && (
            <p className="flex items-center justify-between">
              Operating Systems Supported:{" "}
              <span className="font-semibold tracking-wide">
                {product.operatingSystemsSupported}
              </span>
            </p>
          )}
          {product?.versionType && (
            <p className="flex items-center justify-between">
              Version Type:{" "}
              <span className="font-semibold tracking-wide">
                {product.versionType}
              </span>
            </p>
          )}
          {product?.productStatus && (
            <p className="flex items-center justify-between">
              Product Status:{" "}
              <span className="font-semibold tracking-wide">
                {product.productStatus}
              </span>
            </p>
          )}
          {product?.placeOfOrigin && (
            <p className="flex items-center justify-between">
              Place of Origin:{" "}
              <span className="font-semibold tracking-wide">
                {product.placeOfOrigin}
              </span>
            </p>
          )}
          {product?.activation && (
            <p className="flex items-center justify-between">
              Activation:{" "}
              <span className="font-semibold tracking-wide">
                {product.activation}
              </span>
            </p>
          )}
          {product?.shippingMethod && (
            <p className="flex items-center justify-between">
              Shipping Method:{" "}
              <span className="font-semibold tracking-wide">
                {product.shippingMethod}
              </span>
            </p>
          )}
          {product?.packageInclude && (
            <p className="flex items-center justify-between">
              Package Include:{" "}
              <span className="font-semibold tracking-wide">
                {product.packageInclude}
              </span>
            </p>
          )}
          {product?.language && (
            <p className="flex items-center justify-between">
              Language:{" "}
              <span className="font-semibold tracking-wide">
                {product.language}
              </span>
            </p>
          )}
          {product?.warranty && (
            <p className="flex items-center justify-between">
              Warranty:{" "}
              <span className="font-semibold tracking-wide">
                {product.warranty}
              </span>
            </p>
          )}
          {product?.deliveryTime && (
            <p className="flex items-center justify-between">
              Delivery Time:{" "}
              <span className="font-semibold tracking-wide">
                {product.deliveryTime}
              </span>
            </p>
          )}
          {product?.support && (
            <p className="flex items-center justify-between">
              Support:{" "}
              <span className="font-semibold tracking-wide">
                {product.support}
              </span>
            </p>
          )}
          {product?.function && (
            <p className="flex items-center justify-between">
              Function:{" "}
              <span className="font-semibold tracking-wide">
                {product.function}
              </span>
            </p>
          )}
          {product?.paymentMethods && (
            <p className="flex items-center justify-between">
              Payment Methods:{" "}
              <span className="font-semibold tracking-wide">
                {product.paymentMethods}
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
