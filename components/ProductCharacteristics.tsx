import { Product } from "@/sanity.types";
import React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const slug = product?.slug?.current || "";
  const tKey = (key: string) => key as Parameters<typeof t>[0];
  const intro =
    t.has(tKey(`${slug}.intro`))
      ? t(tKey(`${slug}.intro`))
      : product?.intro;
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          {t("characteristics", { name: product?.name ?? "" })}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1">
          <p className="flex items-center justify-between">
            {t("brand")}:{" "}
            <span className="font-semibold tracking-wide">
              {product?.brandName || product?.brand || t("unknown")}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {t("collection")}:{" "}
            <span className="font-semibold tracking-wide">2024</span>
          </p>
          <p className="flex items-center justify-between">
            {t("type")}:{" "}
            <span className="font-semibold tracking-wide capitalize">
              {product?.osType || product?.productType}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {t("sku")}:{" "}
            <span className="font-semibold tracking-wide uppercase">
              {selectedVariant?.variantSku || product?.sku || tc("na")}
            </span>
          </p>
          {selectedVariant?.color && (
            <p className="flex items-center justify-between">
              {t("color")}:{" "}
              <span className="font-semibold tracking-wide capitalize">
                {selectedVariant.color}
              </span>
            </p>
          )}
          {selectedVariant?.size && (
            <p className="flex items-center justify-between">
              {t("size")}:{" "}
              <span className="font-semibold tracking-wide uppercase">
                {selectedVariant.size}
              </span>
            </p>
          )}
          {product?.operatingSystemsSupported && (
            <p className="flex items-center justify-between">
              {t("operatingSystems")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.operatingSystemsSupported}
              </span>
            </p>
          )}
          {product?.versionType && (
            <p className="flex items-center justify-between">
              {t("versionType")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.versionType}
              </span>
            </p>
          )}
          {product?.productStatus && (
            <p className="flex items-center justify-between">
              {t("productStatus")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.productStatus}
              </span>
            </p>
          )}
          {product?.placeOfOrigin && (
            <p className="flex items-center justify-between">
              {t("placeOfOrigin")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.placeOfOrigin}
              </span>
            </p>
          )}
          {product?.activation && (
            <p className="flex items-center justify-between">
              {t("activation")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.activation}
              </span>
            </p>
          )}
          {product?.shippingMethod && (
            <p className="flex items-center justify-between">
              {t("shippingMethod")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.shippingMethod}
              </span>
            </p>
          )}
          {product?.packageInclude && (
            <p className="flex items-center justify-between">
              {t("packageInclude")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.packageInclude}
              </span>
            </p>
          )}
          {product?.language && (
            <p className="flex items-center justify-between">
              {t("language")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.language}
              </span>
            </p>
          )}
          {product?.warranty && (
            <p className="flex items-center justify-between">
              {t("warranty")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.warranty}
              </span>
            </p>
          )}
          {product?.deliveryTime && (
            <p className="flex items-center justify-between">
              {t("deliveryTime")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.deliveryTime}
              </span>
            </p>
          )}
          {product?.support && (
            <p className="flex items-center justify-between">
              {t("support")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.support}
              </span>
            </p>
          )}
          {product?.function && (
            <p className="flex items-center justify-between">
              {t("function")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.function}
              </span>
            </p>
          )}
          {product?.paymentMethods && (
            <p className="flex items-center justify-between">
              {t("paymentMethods")}:{" "}
              <span className="font-semibold tracking-wide">
                {product.paymentMethods}
              </span>
            </p>
          )}
          <p className="flex items-center justify-between">
            {t("stock")}:{" "}
            <span className="font-semibold tracking-wide">
              {selectedVariant ? (selectedVariant.stock ? t("available") : tc("outOfStock")) : (product?.stock ? t("available") : tc("outOfStock"))}
            </span>
          </p>
          <p className="flex items-center justify-between">
            {t("intro")}:{" "}
            <span className="font-semibold tracking-wide">
              {intro}
            </span>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;
