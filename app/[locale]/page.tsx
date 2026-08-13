import type { Metadata } from "next";
import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";
import ProductGrid from "@/components/ProductGrid";
import PurchaseProcess from "@/components/PurchaseProcess";
import TrustedTechnologyPartners from "@/components/TrustedTechnologyPartners";
import { getAllCategories } from "@/sanity/helpers/queries";
import { getTranslations } from "next-intl/server";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "banner",
  });

  const url = localizedUrl(locale, "");

  return {
    title: { absolute: `${t("title")} | ${SITE_NAME}` },
    description: t("subtitle"),
    alternates: {
      canonical: url,
      languages: hreflangAlternates(""),
    },
    openGraph: {
      title: `${t("title")} | ${SITE_NAME}`,
      description: t("subtitle"),
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
    },
  };
}

export default async function Home() {
  const categories = await getAllCategories();

  return (
    <div className="">
      <Container className="py-10">
        <HomeBanner />
        <ProductGrid categories={categories} />
      </Container>
      <PurchaseProcess />
      <TrustedTechnologyPartners />
    </div>
  );
}