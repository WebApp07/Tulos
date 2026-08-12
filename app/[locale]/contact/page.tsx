import Container from "@/components/Container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTranslations } from "next-intl/server";
import React from "react";

const ContactPage = async () => {
  const t = await getTranslations("contact");

  return (
    <Container className="max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      <p className="mb-6">{t("desc")}</p>
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
