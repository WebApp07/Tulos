import {
  CreditCard,
  Headphones,
  KeyRound,
  ShoppingCart,
} from "lucide-react";
import Container from "./Container";
import Title from "./Title";

const steps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Add your product to the cart",
    description:
      "Find the licence that best suits your needs and add it to your cart with just one click.",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Select your payment method",
    description:
      "Select the most convenient payment method for your purchase and complete the purchase.",
  },
  {
    number: "03",
    icon: KeyRound,
    title: "Receive your licence immediately",
    description:
      "Find your license key, download links, and installation guide in your customer area and in your email inbox.",
  },
  {
    number: "04",
    icon: Headphones,
    title: "We are here to help you",
    description:
      "We take pride in our excellent customer service. If you need support, you can contact us instantly via chat, email, or phone. Additionally, you get a lifetime warranty with Licendi.",
  },
];

const PurchaseProcess = () => {
  return (
    <section className="bg-lightBg" aria-label="Purchase process">
      <Container className="py-16 md:py-20">
        <div className="text-center">
          <Title className="text-3xl md:text-4xl font-bold text-darkColor">
            Purchase process
          </Title>
          <p className="mt-4 text-sm md:text-base text-lightColor/80 max-w-xl mx-auto">
            Get your software license(s) in just 4 simple steps
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
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-lightColor/75 leading-relaxed">
                    {step.description}
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