"use client";
import { Product } from "@/sanity.types";
import React from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import QuantityButtons from "./QuantityButton";
import PriceFormatter from "./PriceFormatter";
import useCartStore from "@/store";
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
  const { addItem, getItemCount } = useCartStore();
  const itemCount = getItemCount(product?._id, selectedVariant);
  const isOutOfStock = (selectedVariant ? selectedVariant.stock : product?.stock) === 0;

  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="w-full text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <QuantityButtons
              product={product}
              selectedVariant={selectedVariant}
            />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Subtotal</span>
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
              `${product?.name?.substring(0, 12)}... added successfully!`,
            );
          }}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-transparent text-darkColor shadow-none border border-darkColor/30 font-semibold tracking-wide hover:text-white hoverEffect",
            className,
          )}
        >
          Add to cart
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
