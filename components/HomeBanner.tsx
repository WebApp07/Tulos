import React from "react";
import Title from "./Title";
import { getTranslations } from "next-intl/server";

const HomeBanner = async () => {
  const t = await getTranslations("banner");
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Title className="text-3xl md:text-4xl uppercase font-bold text-center">
          {t("title")}
      </Title>
      <p className="text-sm text-center text-lightColor/80 font-medium max-w-[480px]">
          {t("subtitle")}
      </p>
    </div>
  );
};

export default HomeBanner;
