import Container from "@/components/Container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTranslations } from "next-intl/server";
import { localizedUrl, hreflangAlternates, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";
import { Building2, Clock, Mail, MapPin } from "lucide-react";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "contact",
  });

  const url = localizedUrl(locale, "/contact");

  return {
    title: t("title"),
    description: t("desc"),
    alternates: {
      canonical: url,
      languages: hreflangAlternates("/contact"),
    },
    openGraph: {
      title: `${t("title")} | ${SITE_NAME}`,
      description: t("desc"),
      type: "website",
      url,
      siteName: SITE_NAME,
      locale,
    },
  };
}

const ContactPage = async () => {
  const t = await getTranslations("contact");

  const details = [
    {
      icon: Building2,
      label: t("companyName"),
      value: t("companyValue"),
    },
    {
      icon: MapPin,
      label: t("address"),
      value: t("addressValue"),
    },
    {
      icon: Mail,
      label: t("email"),
      value: t("emailValue"),
    },
    {
      icon: Clock,
      label: t("hours"),
      value: t("hoursValue"),
    },
  ];

  return (
    <Container className="max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-darkColor mb-2">{t("title")}</h1>
      <p className="mb-8">{t("desc")}</p>

      <section className="bg-lightBg rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-darkColor mb-4">
          {t("businessTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {details?.map(({ icon: Icon, label, value }, index) => (
            <div key={index} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-darkColor shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="font-semibold text-darkColor">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form className="space-y-4">
        <div className="space-y-0.5">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            type="text"
            name="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor="message">{t("message")}</Label>
          <Textarea
            id="message"
            name="message"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-darkColor/80 text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-darkColor hoverEffect"
        >
          {t("send")}
        </button>
      </form>
    </Container>
  );
};

export default ContactPage;