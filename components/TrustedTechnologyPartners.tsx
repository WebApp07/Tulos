import Image from "next/image";
import paypalLogo from "@/images/paypalLogo.png";
import Container from "./Container";
import Title from "./Title";
import { getTranslations } from "next-intl/server";

const partners = [
  {
    name: "Microsoft Partner",
    logo: (
      <span className="flex items-center gap-2">
        <span className="inline-flex grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
            <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
            <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
            <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
          </svg>
        </span>
        <span className="text-xl font-semibold leading-tight text-gray-400 group-hover:text-darkColor transition-colors duration-300 whitespace-nowrap">
          Microsoft Partner
        </span>
      </span>
    ),
  },
  {
    name: "PayPal",
    logo: (
      <Image
        src={paypalLogo}
        alt="PayPal"
        width={2560}
        height={679}
        className="h-7 w-auto object-contain grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
      />
    ),
  },
  {
    name: "Stripe",
    logo: (
      <span className="text-3xl font-bold lowercase tracking-tight text-gray-400 group-hover:text-[#635BFF] transition-colors duration-300">
        stripe
      </span>
    ),
  },
  {
    name: "Clerk",
    logo: (
      <span className="text-2xl font-semibold text-gray-400 group-hover:text-darkColor transition-colors duration-300">
        Clerk
      </span>
    ),
  },
  {
    name: "Bizee",
    logo: (
      <span className="text-2xl font-semibold lowercase text-gray-400 group-hover:text-darkColor transition-colors duration-300">
        bizee
      </span>
    ),
  },
];

const TrustedTechnologyPartners = async () => {
  const t = await getTranslations("trustedPartners");
  return (
    <section
      className="bg-white"
      aria-label={t("title")}
    >
      <Container className="py-16 md:py-20">
        <div className="text-center">
          <Title className="text-3xl md:text-4xl font-bold text-darkColor">
            {t("title")}
          </Title>
          <p className="mt-4 text-sm md:text-base text-lightColor/80 max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 md:mt-14 flex flex-wrap items-stretch justify-center gap-4 md:gap-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex grow basis-[46%] md:basis-[30%] lg:basis-[17.5%] items-center justify-center rounded-xl border border-gray-100 bg-white px-4 md:px-6 py-8 md:py-10 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg"
            >
              {partner.logo}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TrustedTechnologyPartners;