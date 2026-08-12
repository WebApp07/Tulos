import { Product } from "@/sanity.types";
import React from "react";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import useCartStore from "@/store";
import toast from "react-hot-toast";
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
const QuantityButtons = ({ product, className, selectedVariant }: Props) => {
  const t = useTranslations("common");
  const { addItem, getItemCount, removeItem } = useCartStore();
  const itemCount = getItemCount(product?._id, selectedVariant);
  const isOutOfStock = (selectedVariant ? selectedVariant.stock : product?.stock) === 0;
  const handleRemoveProduct = () => {
    removeItem(product?._id, selectedVariant);
    if (itemCount > 1) {
      toast.success(t("quantityDecreased"));
    } else {
      toast.success(
        t("removedFromCart", {
          name: `${product?.name?.substring(0, 12)}`,
        }),
      );
    }
  };
  return (
    <div className={cn("flex items-center gap-1 text-base pb-1", className)}>
      <Button
        onClick={handleRemoveProduct}
        disabled={itemCount === 0 || isOutOfStock}
        variant="outline"
        size="icon"
        className="w-6 h-6"
      >
        <Minus />
      </Button>
      <span className="font-semibold w-8 text-center text-darkColor">
        {itemCount}
      </span>
      <Button
        onClick={() => {
          addItem(product, selectedVariant);
          toast.success(
            t("addedToCart", {
              name: `${product?.name?.substring(0, 12)}...`,
            }),
          );
        }}
        variant="outline"
        size="icon"
        className="w-6 h-6"
      >
        <Plus />
      </Button>
    </div>
  );
};

export default QuantityButtons;
