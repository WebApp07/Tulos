import { Product } from "@/sanity.types";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const isOutOfStock = product?.stock === 0;

  return (
    <div>
      <Button
        disabled={isOutOfStock}
        className={cn(
          "w-full bg-transparent text-darkColor shadow-none border border-darkColor/30 font-semibold tracking-wide hover:text-white hoverEffect",
          className,
        )}
      >
        Add to cart
      </Button>
    </div>
  );
};

export default AddToCartButton;
