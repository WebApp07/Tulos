import React from "react";
import Container from "@/components/Container";
import { getTranslations } from "next-intl/server";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";
import {
  BadgeCheck,
  Building2,
  Mail,
  MapPin,
  ShieldCheck,
  Zap,
  CreditCard,
  LifeBuoy,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const MICROSOFT_PARTNER_URL =
  "https://marketplace.microsoft.com/en-us/marketplace/partner-dir/f2266aa5-5704-4384-ad55-100cf2c530cb/overview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "about",
  });

  const url = localizedUrl(locale, "/about");

  return {
    title: t("title"),
    description: t("intro"),
    alternates: {
      canonical: url,
      languages: hreflangAlternates("/about"),
    },
    openGraph: {
      title: `${t("title")} | ${SITE_NAME}`,
      description: t("intro"),
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
    },
  };
}

const AboutPage = async () => {
  const t = await getTranslations("about");
  const trust = t.raw("trust") as string[];

  const trustIcons = [ShieldCheck, Zap, CreditCard, LifeBuoy];

  return (
    <Container className="max-w-6xl lg:px-8 py-12">
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold text-darkColor mb-4">{t("title")}</h1>
        <p className="text-lg text-lightColor leading-relaxed max-w-3xl mx-auto">
          {t("intro")}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        <div className="bg-lightBg rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-darkColor mb-3">
            {t("missionTitle")}
          </h2>
          <p className="text-lightColor leading-relaxed">{t("mission")}</p>
        </div>
        <div className="bg-lightBg rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-darkColor mb-3">
            {t("partnerTitle")}
          </h2>
          <p className="text-lightColor leading-relaxed mb-4">{t("partner")}</p>
          <a
            href={MICROSOFT_PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-darkColor px-5 py-2.5 rounded-lg hover:bg-gray-800 hoverEffect"
          >
            <BadgeCheck className="w-4 h-4" />
            {t("partnerCta")}
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        <div className="bg-lightBg rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-darkColor mb-3">
            {t("productsTitle")}
          </h2>
          <p className="text-lightColor leading-relaxed">{t("products")}</p>
        </div>
        <div className="bg-lightBg rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-darkColor mb-3">
            {t("deliveryTitle")}
          </h2>
          <p className="text-lightColor leading-relaxed">{t("delivery")}</p>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-2xl font-semibold text-darkColor text-center mb-8">
          {t("trustTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trust?.map((item, index) => {
            const Icon = trustIcons[index % trustIcons.length];
            return (
              <div
                key={index}
                className="flex items-center gap-3 bg-lightBg rounded-xl p-5"
              >
                <Icon className="w-6 h-6 text-darkColor shrink-0" />
                <p className="text-sm font-medium text-darkColor">{item}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-lightBg rounded-xl p-8 mb-14">
        <h2 className="text-2xl font-semibold text-darkColor mb-6">
          {t("businessTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-darkColor shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t("businessCompany")}
              </p>
              <p className="font-semibold text-darkColor">
                {t("businessCompanyValue")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-darkColor shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {t("businessAddress")}
              </p>
              <p className="font-semibold text-darkColor">
                {t("businessAddressValue")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-darkColor shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("businessEmail")}</p>
              <p className="font-semibold text-darkColor">
                {t("businessEmailValue")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center bg-darkColor rounded-xl p-10">
        <h2 className="text-2xl font-bold text-white mb-3">{t("ctaTitle")}</h2>
        <p className="text-white/80 mb-6">{t("ctaDesc")}</p>
        <Link
          href={"/"}
          className="inline-block text-sm font-semibold text-darkColor bg-white px-6 py-3 rounded-lg hover:bg-gray-100 hoverEffect"
        >
          {t("ctaButton")}
        </Link>
      </section>
    </Container>
  );
};

export default AboutPage;