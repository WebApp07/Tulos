"use client";

import { PayPalButtons as PayPalButtonsLib } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { capturePayPalOrder } from "@/actions/paypalActions";
import { CartItem } from "@/store";
import { useCurrency } from "./CurrencyProvider";

interface Props {
  items: CartItem[];
  totalPrice: number;
  metadata: {
    customerName: string;
    customerEmail: string;
    clerkUserId?: string;
  };
}

export function PayPalButtons({ items, totalPrice, metadata }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { currency, rate, ready } = useCurrency();

  const orderNumber = crypto.randomUUID();

  const convertedTotal = (totalPrice * rate).toFixed(2);

  return (
    <div className="w-full relative z-0">
      {isPending && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <p className="font-semibold">Processing...</p>
        </div>
      )}
      <PayPalButtonsLib
        style={{ layout: "vertical", label: "checkout", shape: "pill" }}
        disabled={!ready}
        createOrder={(data, actions) => {
          if (!metadata.customerName || !metadata.customerEmail) {
            toast.error("Please enter your name and email address first.");
            return Promise.reject(new Error("Missing customer info"));
          }

          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: currency,
                  value: convertedTotal,
                },
                description: `Order ${orderNumber}`,
              },
            ],
          });
        }}
        onApprove={async (data) => {
          setIsPending(true);
          try {
            const result = await capturePayPalOrder(
              data.orderID,
              items,
              {
                ...metadata,
                orderNumber,
                totalPrice: parseFloat(convertedTotal),
                currency,
              },
            );

            if (result.success) {
              toast.success("Payment successful!");
              router.push(`/success?orderNumber=${orderNumber}`);
            } else {
              toast.error(result.error || "Payment capture failed");
            }
          } catch (error) {
            console.error("onApprove error:", error);
            toast.error("An error occurred during payment processing");
          } finally {
            setIsPending(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          toast.error("PayPal payment failed to initialize");
        }}
      />
      <p className="text-[10px] text-center text-gray-400 mt-1">
        Secure payment via PayPal. Credit and Debit cards accepted.
      </p>
    </div>
  );
}
