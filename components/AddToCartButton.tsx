"use client";
import { Product } from "@/sanity.types";
import React from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import QuantityButtons from "./QuantityButton";
import PriceFormatter from "./PriceFormatter";
import useCartStore from "@/store";
import { useTranslations } from "next-intl";
interface Props {
  product: Product;
  className?: string;
  selectedVariant?: {
    color?: string;
    size?: string;
    variantSku?: string;
    stock?: number;
    price?: number;
  } | null;
}

const AddToCartButton = ({ product, className, selectedVariant }: Props) => {
  const t = useTranslations("common");
  const { addItem, getItemCount } = useCartStore();
  const itemCount = getItemCount(product?._id, selectedVariant);
  const isOutOfStock = (selectedVariant ? selectedVariant.stock : product?.stock) === 0;

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="w-full text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("quantity")}</span>
            <QuantityButtons
              product={product}
              selectedVariant={selectedVariant}
            />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">{t("subtotal")}</span>
            <PriceFormatter
              amount={
                (selectedVariant?.price || product?.price || 0) * itemCount
              }
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => {
            addItem(product, selectedVariant);
            toast.success(
              t("addedToCart", {
                name: `${product?.name?.substring(0, 12)}...`,
              }),
            );
          }}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-transparent text-darkColor shadow-none border border-darkColor/30 font-semibold tracking-wide hover:text-white hoverEffect",
            className,
          )}
        >
          {t("addToCart")}
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
