import React from "react";
import Container from "./Container";
import FooterTop from "./FooterTop";
import Logo from "./Logo";
import { Input } from "./ui/input";
import { quickLinksData } from "@/constants";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getAllCategories } from "@/sanity/helpers/queries";

const quickLinkTitleKeys: Record<
  string,
  | "aboutUs"
  | "contactUs"
  | "termsConditions"
  | "privacyPolicy"
  | "refundPolicy"
  | "shippingPolicy"
  | "faqs"
  | "blog"
> = {
  "About us": "aboutUs",
  "Contact us": "contactUs",
  "Blog": "blog",
  "Terms & Conditions": "termsConditions",
  "Privacy Policy": "privacyPolicy",
  "Refund Policy": "refundPolicy",
  "Shipping Policy": "shippingPolicy",
  "FAQs": "faqs",
};

const Footer = async () => {
  const t = await getTranslations("footer");
  const categories = await getAllCategories();
  return (
    <footer className="bg-white border-t">
      <Container>
        <FooterTop />
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo>Licendi</Logo>
            <p className="text-gray-600 text-sm">{t("description")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-darkColor mb-4">{t("quickLinks")}</h3>
            <div className="flex flex-col gap-3">
              {quickLinksData?.map((item) => (
                <Link
                  key={item?.title}
                  href={item?.href}
                  className="text-gray-600 hover:text-darkColor text-sm font-medium hoverEffect"
                >
                  {t(quickLinkTitleKeys[item?.title])}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-darkColor mb-4">{t("categories")}</h3>
            <div className="flex flex-col gap-3">
              {categories?.map((item) => (
                <Link
                  key={item?._id}
                  href={`/category/${item?.slug?.current}`}
                  className="text-gray-600 hover:text-darkColor text-sm font-medium hoverEffect"
                >
                  {item?.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-darkColor mb-4">{t("newsletter")}</h3>
            <p className="text-gray-600 text-sm mb-4">{t("newsletterDesc")}</p>
            <form className="space-y-3">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button
                type="submit"
                className="w-full bg-darkColor text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t("subscribe")}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
