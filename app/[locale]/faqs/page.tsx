import Container from "@/components/Container";
import Title from "@/components/Title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getTranslations } from "next-intl/server";
import React from "react";

const FaqsPage = async () => {
  const t = await getTranslations("faqs");
  const faqs = t.raw("items") as { q: string; a: string }[];

  return (
    <Container className="max-w-4xl sm:px-6 lg:px-8 py-12">
      <Title className="text-3xl">{t("title")}</Title>
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
