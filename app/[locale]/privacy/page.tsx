import Container from "@/components/Container";
import { getTranslations } from "next-intl/server";
import React from "react";

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
