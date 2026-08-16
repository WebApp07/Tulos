import type { Metadata } from "next";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import BlogCard from "@/components/blog/BlogCard";
import { Link } from "@/i18n/navigation";
import {
  getBrandBySlug,
  type BrandPage,
} from "@/sanity/helpers/brandQueries";
import { urlFor } from "@/sanity/lib/image";
import { translateText } from "@/lib/translate";
import { notFound } from "next/navigation";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/sanity.types";
import type { BlogPost } from "@/sanity/helpers/blogQueries";

type BrandPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

function brandName(brand: BrandPage): string {
  return brand.title || brand.slug?.current || "Brand";
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};

  const isDefaultLocale = locale === "en";
  const fallbackTitle = brand.seoTitle || brandName(brand);
  const fallbackDescription = brand.seoDescription || brand.description || "";

  const [title, description] = isDefaultLocale
    ? [fallbackTitle, fallbackDescription]
    : await Promise.all([
        translateText(fallbackTitle, locale),
        translateText(fallbackDescription, locale),
      ]);

  const url = localizedUrl(locale, `/brand/${slug}`);

  const logo = brand.logo
    ? urlFor(brand.logo).width(1200).url()
    : undefined;

  return {
    title,
    description: description || undefined,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(`/brand/${slug}`),
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: description || undefined,
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
      images: logo ? [{ url: logo }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: logo ? [logo] : undefined,
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "brand" });
  const brand = await getBrandBySlug(slug);
  if (!brand) return notFound();

  const isDefaultLocale = locale === "en";
  const name = brandName(brand);
  const description = isDefaultLocale
    ? brand.description
    : brand.description
      ? await translateText(brand.description, locale)
      : "";

  const url = localizedUrl(locale, `/brand/${slug}`);

  const products = brand.products ?? [];
  const categories = brand.categories ?? [];
  const posts = brand.showPosts === false ? [] : (brand.posts ?? []);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: localizedUrl(locale, ""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: url,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: description || undefined,
    url,
    inLanguage: locale,
    brand: {
      "@type": "Brand",
      name,
      url,
      logo: brand.logo ? urlFor(brand.logo).url() : undefined,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
        url: product.slug?.current
          ? localizedUrl(locale, `/product/${product.slug.current}`)
          : undefined,
      })),
    },
  };

  return (
    <Container className="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-lightColor mb-6"
      >
        <Link href="/" className="hover:text-darkColor hoverEffect">
          {t("home")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-darkColor">{name}</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          {brand.logo && (
            <Image
              src={urlFor(brand.logo).width(160).height(160).url()}
              alt={brand.logo.altText || `${name} logo`}
              width={160}
              height={160}
              className="w-16 h-16 object-contain rounded-lg border border-darkColor/10 bg-white p-2"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-darkColor">
            {name}
          </h1>
        </div>
        {description && (
          <p className="text-lg text-lightColor leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </header>

      {products.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-darkColor mb-6">
            {t("products")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product as Product} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-darkColor mb-6">
            {t("categories")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug?.current}`}
                className="group border border-zinc-200 rounded-xl p-5 hover:border-darkColor/25 hoverEffect"
              >
                <h3 className="font-semibold text-darkColor group-hover:text-darkColor/80 hoverEffect">
                  {category.title}
                </h3>
                {category.description && (
                  <p className="text-sm text-lightColor mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-darkColor mb-6">
            {t("posts")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post as BlogPost} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}