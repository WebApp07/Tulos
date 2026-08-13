import type { Metadata } from "next";
import Container from "@/components/Container";
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
    namespace: "privacy",
  });

  const url = localizedUrl(locale, "/privacy");

  return {
    title: t("title"),
    alternates: {
      canonical: url,
      languages: hreflangAlternates("/privacy"),
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

const PrivacyPage = async () => {
  const t = await getTranslations("privacy");
  const sections = t.raw("sections") as { heading: string; body: string }[];

  return (
    <Container className="max-w-3xl sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <div className="space-y-4">
        {sections?.map((section, index) => (
          <section key={index}>
            <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
};

export default PrivacyPage;
