"use client";

import { useState } from "react";
import { Product } from "@/sanity.types";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import {
  Heart,
  BoxIcon,
  FileQuestion,
  ListOrderedIcon,
  Share,
} from "lucide-react";
import ProductCharacteristics from "./ProductCharacteristics";
import ImageView from "./ImageView";

export default function ProductInfo({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].color : null
  );

  const [selectedSize, setSelectedSize] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].size : null
  );

  const colors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean))
  );
  const availableSizes =
    product.variants?.filter((v) => v.color === selectedColor) || [];

  const selectedVariant =
    product.variants?.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    ) ||
    availableSizes[0] ||
    null;

  const price = selectedVariant?.price || product.price;
  const stock =
    selectedVariant?.stock !== undefined ? selectedVariant.stock : product.stock;

  // Compute images to show
  const productImages = product.images || [];
  const variantImage = selectedVariant?.variantImage;
  const displayImages = variantImage
    ? [
        variantImage,
        ...productImages.filter((img) => img._key !== variantImage._key),
      ]
    : productImages;

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <ImageView images={displayImages} />
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {product.brand}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h2>
          <PriceView
            price={price}
            discount={product.discount}
            className="text-lg font-bold"
          />
        </div>

        {stock && stock > 0 ? (
          <p className="bg-green-100 w-24 text-center text-green-600 text-sm py-2.5 font-semibold rounded-lg">
            In Stock
          </p>
        ) : (
          <p className="bg-red-100 w-24 text-center text-red-600 text-sm py-2.5 font-semibold rounded-lg">
            Out of Stock
          </p>
        )}

        <p className="text-sm text-gray-600 tracking-wide">
          {product.description}
        </p>

        {/* Color Selection */}
        {colors.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold uppercase">
              Color: {selectedColor}
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    const sizesForColor =
                      product.variants?.filter((v) => v.color === color) || [];
                    if (sizesForColor.length > 0) {
                      if (!sizesForColor.some((v) => v.size === selectedSize)) {
                        setSelectedSize(sizesForColor[0].size);
                      }
                    }
                  }}
                  className={`border py-2 px-3 text-sm font-semibold transition-all ${
                    selectedColor === color
                      ? "border-darkColor bg-darkColor text-white"
                      : "border-gray-200 hover:border-darkColor"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {availableSizes.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase">
                Size: {selectedSize}
              </label>
              <span className="text-xs text-gray-500 underline cursor-pointer">
                Size Guide
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((variant) => (
                <button
                  key={variant._key}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`border py-2 px-3 text-sm font-semibold transition-all ${
                    selectedSize === variant.size
                      ? "border-darkColor bg-darkColor text-white"
                      : "border-gray-200 hover:border-darkColor"
                  } ${
                    variant.stock && variant.stock <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={variant.stock !== undefined && variant.stock <= 0}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 lg:gap-5">
          <AddToCartButton
            product={product}
            selectedVariant={selectedVariant}
            className="bg-darkColor/80 text-white hover:bg-darkColor hoverEffect"
          />
          <button className="border-2 border-darkColor/30 text-darkColor/60 px-2.5 py-1.5 rounded-md hover:text-darkColor hover:border-darkColor hoverEffect">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <ProductCharacteristics
          product={product}
          selectedVariant={selectedVariant}
        />

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200 py-5 -mt-2">
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <BoxIcon className="w-5 h-5" />
            <p>Compare color</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <FileQuestion className="w-5 h-5" />
            <p>Ask a question</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <ListOrderedIcon className="w-5 h-5" />
            <p>Delivery & Return</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <Share className="w-5 h-5" />
            <p>Share</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue rounded-md hoverEffect">
            <p className="text-base font-semibold text-darkColor">Free Shipping</p>
            <p className="text-sm text-gray-500">Free shipping over order $120</p>
          </div>
          <div className="border border-darkBlue/20 text-center p-3 hover:border-darkBlue rounded-md hoverEffect">
            <p className="text-base font-semibold text-darkColor">
              Flexible Payment
            </p>
            <p className="text-sm text-gray-500">Pay with Multiple Credit Cards</p>
          </div>
        </div>
      </div>
    </div>
  );
}
