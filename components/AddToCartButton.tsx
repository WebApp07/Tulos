import { Product } from "@/sanity.types";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import QuantityButton from "./QuantityButton";
import PriceFormatter from "./PriceFormatter";
interface Props {
  product: Product;
  className?: string;
  selectedVariant?: any;
}

const AddToCartButton = ({ product, className, selectedVariant }: Props) => {
  const isOutOfStock = product?.stock === 0;
  const itemCount = 4;

  const price = selectedVariant?.price || product?.price;

  return (
    <div>
      {itemCount ? (
        <div className="w-full text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <QuantityButton product={product} />
          </div>
          {selectedVariant && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Variant</span>
              <span>
                {selectedVariant.color && `${selectedVariant.color} - `}
                {selectedVariant.size}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-1">
            <span className="tex-xs font-semibold">Subtotal</span>
            <PriceFormatter amount={price ? price * itemCount : 0} />
          </div>
        </div>
      ) : (
        <Button
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
