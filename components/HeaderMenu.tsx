"use client";
import { Category } from "@/sanity.types";
import type { BrandSummary } from "@/sanity/helpers/brandQueries";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
 
interface Props {
  categories: Category[];
  brands: BrandSummary[];
}
 
const HeaderMenu = ({ categories, brands }: Props) => {
  const t = useTranslations("header");
  const pathname = usePathname();
  const [brandsOpen, setBrandsOpen] = useState(false);
  const brandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        brandsRef.current &&
        !brandsRef.current.contains(event.target as Node)
      ) {
        setBrandsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="hidden md:inline-flex w-1/3 items-center gap-5 text-sm capitalize font-semibold">
      <Link
        href={"/"}
        className={`hover:text-darkColor hoverEffect relative group ${
          pathname === "/" && "text-darkColor"
        }`}
      >
        {t("home")}
        <span
          className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor hoverEffect group-hover:w-1/2 group-hover:left-0 ${
            pathname === "/" && "w-1/2"
          }`}
        />
        <span
          className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor hoverEffect group-hover:w-1/2 group-hover:right-0 ${
            pathname === "/" && "w-1/2"
          }`}
        />
      </Link>
      {categories?.map((item) => (
        <Link
          key={item?._id}
          href={`/category/${item?.slug?.current}`}
          className={`hover:text-darkColor hoverEffect relative group ${
            pathname === `/category/${item?.slug?.current}` && "text-darkColor"
          }`}
        >
          {item?.title}
          <span
            className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor hoverEffect group-hover:w-1/2 group-hover:left-0 ${
              pathname === `/category/${item?.slug?.current}` && "w-1/2"
            }`}
          />
          <span
            className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor hoverEffect group-hover:w-1/2 group-hover:right-0 ${
              pathname === `/category/${item?.slug?.current}` && "w-1/2"
            }`}
          />
        </Link>
      ))}
      {brands.length > 0 && (
        <div className="relative" ref={brandsRef}>
          <button
            type="button"
            onClick={() => setBrandsOpen((v) => !v)}
            className="inline-flex items-center gap-1 hover:text-darkColor hoverEffect"
          >
            {t("brands")}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {brandsOpen && (
            <div className="absolute left-0 top-full pt-3">
              <div className="bg-white border border-gray-200 shadow-lg rounded-lg py-2 min-w-44">
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    href={`/brand/${brand.slug?.current}`}
                    onClick={() => setBrandsOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-lightColor hover:text-darkColor hover:bg-lightBg hoverEffect"
                  >
                    {brand.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <Link
        href={"/blog"}
        className={`hover:text-darkColor hoverEffect relative group ${
          pathname.startsWith("/blog") && "text-darkColor"
        }`}
      >
        {t("blog")}
        <span
          className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-darkColor hoverEffect group-hover:w-1/2 group-hover:left-0 ${
            pathname.startsWith("/blog") && "w-1/2"
          }`}
        />
        <span
          className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-darkColor hoverEffect group-hover:w-1/2 group-hover:right-0 ${
            pathname.startsWith("/blog") && "w-1/2"
          }`}
        />
      </Link>
    </div>
  );
};

export default HeaderMenu;