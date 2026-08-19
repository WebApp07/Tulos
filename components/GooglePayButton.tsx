"use client";

import { createWalletCheckoutSession } from "@/actions/createCheckoutSession";
import { useCurrency } from "@/components/CurrencyProvider";
import { CartItem } from "@/store";
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
  useCheckoutElements,
  type ExpressCheckoutElementProps,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface WalletMetadata {
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
}

interface GooglePayButtonProps {
  items: CartItem[];
  metadata: WalletMetadata;
}

function WalletCheckoutForm() {
  const t = useTranslations("payment");
  const checkoutState = useCheckoutElements();
  const [hasPaymentMethods, setHasPaymentMethods] = useState(false);

  if (checkoutState.type === "loading") {
    return null;
  }

  if (checkoutState.type === "error") {
    // Generic log only – never include the raw error payload (it may contain
    // card/browser details) in the console.
    console.error("Wallet checkout failed to initialize");
    return null;
  }

  const handleConfirm: ExpressCheckoutElementProps["onConfirm"] = async (
    event,
  ) => {
    if (checkoutState.type !== "success") return;
    try {
      const result = await checkoutState.checkout.confirm({
        expressCheckoutConfirmEvent: event,
      });
      if (result.type === "error") {
        toast.error(t("paymentFailed"));
      }
    } catch {
      console.error("Wallet payment confirmation failed");
      toast.error(t("paymentError"));
    }
  };

  const handleAvailabilityChange: ExpressCheckoutElementProps["onAvailablePaymentMethodsChange"] =
    ({ paymentMethods }) => {
      // The Express Checkout Element only reports available methods for
      // eligible browsers/devices, so Google Pay never renders otherwise.
      setHasPaymentMethods(Boolean(paymentMethods));
    };

  return (
    <div className={hasPaymentMethods ? "" : "hidden"}>
      <ExpressCheckoutElement
        options={{
          buttonHeight: 50,
          buttonTheme: {},
          buttonType: { googlePay: "pay" },
          layout: {},
          paymentMethodOrder: ["google_pay"],
          paymentMethods: {
            googlePay: "auto",
            applePay: "never",
            link: "never",
            paypal: "never",
          },
        }}
        onConfirm={handleConfirm}
        onCancel={() => {
          // Customer dismissed the wallet sheet – no action required.
        }}
        onLoadError={() => {
          console.error("Wallet button failed to load");
          toast.error(t("paymentError"));
        }}
        onAvailablePaymentMethodsChange={handleAvailabilityChange}
      />
    </div>
  );
}

export function GooglePayButton({ items, metadata }: GooglePayButtonProps) {
  const { currency } = useCurrency();
  const { customerName, customerEmail, clerkUserId } = metadata;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initFailed, setInitFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setClientSecret(null);
    setInitFailed(false);

    if (!stripePromise || !customerName || !customerEmail) {
      return;
    }

    // Debounce so we don't create a fresh Checkout Session on every keystroke
    // while the customer is filling in their details.
    const timer = setTimeout(async () => {
      try {
        const result = await createWalletCheckoutSession(
          items,
          {
            orderNumber: crypto.randomUUID(),
            customerName,
            customerEmail,
            clerkUserId,
          },
          currency,
        );
        if (!cancelled && result?.clientSecret) {
          setClientSecret(result.clientSecret);
        }
      } catch {
        if (!cancelled) {
          console.error("Wallet checkout session creation failed");
          setInitFailed(true);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items, currency, customerName, customerEmail, clerkUserId]);

  if (!stripePromise || initFailed || !clientSecret) {
    return null;
  }

  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <WalletCheckoutForm />
    </CheckoutElementsProvider>
  );
}