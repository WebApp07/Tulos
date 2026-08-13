import type { Metadata } from "next";
import Container from "@/components/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getTranslations } from "next-intl/server";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "faqs",
  });

  const url = localizedUrl(locale, "/faqs");

  return {
    title: t("title"),
    alternates: {
      canonical: url,
      languages: hreflangAlternates("/faqs"),
    },
    openGraph: {
      title: `${t("title")} | ${SITE_NAME}`,
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
    },
  };
}

const FaqsPage = async () => {
  const t = await getTranslations("faqs");
  const faqs = t.raw("items") as { q: string; a: string }[];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <Container className="max-w-4xl sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-0"
      >
        {faqs?.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="group">
            <AccordionTrigger className="text-left text-lg font-semibold text-darkColor/80 group-hover:text-darkColor hover:no-underline hoverEffect">
              {faq?.q}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              {faq?.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
};

export default FaqsPage;