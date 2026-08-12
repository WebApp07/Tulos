"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useCurrency } from "./CurrencyProvider";

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  const { currency } = useCurrency();

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency,
        intent: "capture",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}