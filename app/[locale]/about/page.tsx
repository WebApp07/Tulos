import Container from "@/components/Container";
import { getTranslations } from "next-intl/server";
import React from "react";

const AboutPage = async () => {
  const t = await getTranslations("about");

  return (
    <Container className="max-w-6xl lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <p className="mb-4">{t("paragraphs.0")}</p>
      <p className="mb-4">{t("paragraphs.1")}</p>
      <p>{t("paragraphs.2")}</p>
    </Container>
  );
};

export default AboutPage;
