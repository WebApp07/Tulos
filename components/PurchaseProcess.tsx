import {
  CreditCard,
  Headphones,
  KeyRound,
  ShoppingCart,
} from "lucide-react";
import Container from "./Container";
import Title from "./Title";
import { getTranslations } from "next-intl/server";

const steps = [
  { number: "01", icon: ShoppingCart, titleKey: "step1Title", descKey: "step1Desc" },
  { number: "02", icon: CreditCard, titleKey: "step2Title", descKey: "step2Desc" },
  { number: "03", icon: KeyRound, titleKey: "step3Title", descKey: "step3Desc" },
  { number: "04", icon: Headphones, titleKey: "step4Title", descKey: "step4Desc" },
] as const;

const PurchaseProcess = async () => {
  const t = await getTranslations("purchaseProcess");
  return (
    <section className="bg-lightBg" aria-label={t("title")}>
      <Container className="py-16 md:py-20">
        <div className="text-center">
          <Title className="text-3xl md:text-4xl font-bold text-darkColor">
            {t("title")}
          </Title>
          <p className="mt-4 text-sm md:text-base text-lightColor/80 max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative mt-14 md:mt-16">
          <div
            aria-hidden
            className="hidden lg:block absolute top-[4rem] left-[12.5%] right-[12.5%] border-t-2 border-dashed border-gray-300"
          />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {steps.map((step) => (
              <li key={step.number}>
                <article className="group relative h-full bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl">
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 rounded-xl bg-darkBlue/10 text-darkBlue flex items-center justify-center transition-all duration-300 ease-in-out group-hover:bg-darkBlue group-hover:text-white">
                      <step.icon
                        className="w-7 h-7"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-darkColor text-white text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-base md:text-lg font-semibold text-darkColor">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-2.5 text-sm text-lightColor/75 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
};

export default PurchaseProcess;