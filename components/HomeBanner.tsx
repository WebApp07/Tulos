import React from "react";
import { getTranslations } from "next-intl/server";

const HomeBanner = async () => {
  const t = await getTranslations("banner");
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h1 className="text-3xl md:text-4xl uppercase font-bold text-center">
          {t("title")}
      </h1>
      <p className="text-sm text-center text-lightColor/80 font-medium max-w-[480px]">
          {t("subtitle")}
      </p>
    </div>
  );
};

export default HomeBanner;
