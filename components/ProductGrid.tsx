"use client";
import React, { useEffect, useState } from "react";
import HomeTabbar from "./HomeTabbar";
import { client } from "@/sanity/lib/client";
import { Category, Product } from "@/sanity.types";
import ProductCard from "./ProductCard";
import NoProductsAvailable from "./NoProductsAvailable";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  categories: Category[];
}

const ProductGrid = ({ categories }: Props) => {
  const t = useTranslations("home");
  const locale = useLocale();
  const [selectedTab, setSelectedTab] = useState(
    categories[0]?.slug?.current || ""
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const query = `*[_type == 'product' && references(*[_type == 'category' && slug.current == $categorySlug]._id)] | order(name asc)`;
    const params = { categorySlug: selectedTab };
    const fetchData = async () => {
      setLoading(true);
      try {
        const response: Product[] = await client.fetch(query, params);
        if (locale === "en") {
          setProducts(response);
        } else {
          const { translated } = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: response.flatMap((p) => [p.name || "", p.intro || ""]),
              locale,
            }),
          }).then((res) => res.json());

          setProducts(
            response.map((product, index) => ({
              ...product,
              name: translated[index * 2] || product.name,
              intro: translated[index * 2 + 1] || product.intro,
            })),
          );
        }
      } catch (error) {
        console.log("Product fetching Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab, locale]);

  return (
    <div className="mt-10 flex flex-col items-center">
      <HomeTabbar
        selectedTab={selectedTab}
        onTabSelect={setSelectedTab}
        categories={categories}
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full mt-10">
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="animate-spin" />
            <span className="text-lg font-semibold">{t("loading")}</span>
          </div>
        </div>
      ) : (
        <>
          {products?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10 w-full">
              {products?.map((product: Product) => (
                <AnimatePresence key={product?._id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          ) : (
            <NoProductsAvailable selectedTab={selectedTab} />
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
