"use client";

import { useState } from "react";
import ImageView from "./ImageView";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import { Heart } from "lucide-react";
import { Product } from "@/sanity.types";
import { useTranslations } from "next-intl";

export default function ProductDetails({ product }: { product: Product }) {
  const t = useTranslations("product");
  const tc = useTranslations("common");
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const price = selectedVariant?.price || (product.price ?? 0);

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <ImageView images={product.images} />
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {product.brand}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 uppercase">
            {product.name}
          </h1>
          {selectedVariant?.color && (
            <p className="text-sm font-semibold text-darkColor mb-1">
              {t("color")}: <span className="font-bold">{selectedVariant.color}</span>
            </p>
          )}
          <div className="flex items-center gap-2">
            <PriceView
              price={price}
              discount={product.discount}
              className="text-xl font-bold"
            />
            {product.variants && product.variants.length > 0 && (
              <span className="text-sm text-gray-500 font-medium">{t("up")}</span>
            )}
          </div>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase">{t("selectSize")}</label>
              <span className="text-xs text-gray-500 underline cursor-pointer">{t("sizeGuide")}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {product.variants?.map((variant, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(variant)}
                  className={`border py-2 px-3 text-sm font-semibold transition-all ${
                    selectedVariant === variant
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black"
                  } ${(variant.stock ?? 0) <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={(variant.stock ?? 0) <= 0}
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
            className="flex-1 bg-black text-white py-4 rounded-none uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors"
          />
          <button className="border border-gray-200 p-4 hover:border-black transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Product Details Section */}
        <div className="border-t pt-6 mt-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
            {t("productDetails")}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Info Grid like the image */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-6 gap-x-4 border-t border-b py-8 mt-6">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-tighter">
              {t("manufacturerSku")}
            </p>
            <p className="text-xs font-bold uppercase">{product.sku || tc("na")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-tighter">
              {t("brand")}
            </p>
            <p className="text-xs font-bold uppercase">{product.brand || tc("na")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-tighter">
              {t("gender")}
            </p>
            <p className="text-xs font-bold uppercase">{product.gender || tc("na")}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-tighter">
              {t("nickname")}
            </p>
            <p className="text-xs font-bold uppercase">
              {product.nickname || tc("na")}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] uppercase text-gray-400 font-extrabold tracking-tighter">
              {t("releaseDate")}
            </p>
            <p className="text-xs font-bold uppercase">
              {product.releaseDate || tc("na")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
