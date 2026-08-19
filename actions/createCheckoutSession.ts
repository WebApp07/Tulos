"use server";

import stripe from "@/lib/stripe";
import { urlFor } from "@/sanity/lib/image";
import { CartItem } from "@/store";
import { getExchangeRate } from "@/lib/currency";
import { DEFAULT_CURRENCY } from "@/lib/currencyConfig";
import { SITE_URL } from "@/lib/site";
import Stripe from "stripe";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
}

async function buildSessionPayload(
  items: CartItem[],
  metadata: Metadata,
  currency: string,
): Promise<Stripe.Checkout.SessionCreateParams> {
  const rate = await getExchangeRate(currency);
  const targetCurrency = currency.toLowerCase();

  // Find existing customer
  const customers = await stripe.customers.list({
    email: metadata.customerEmail,
    limit: 1,
  });

  const customerId =
    customers.data.length > 0 ? customers.data[0].id : undefined;

  const sessionPayload: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",

    metadata: {
      orderNumber: metadata.orderNumber,
      customerName: metadata.customerName,
      customerEmail: metadata.customerEmail,
      ...(metadata.clerkUserId && { clerkUserId: metadata.clerkUserId }),
    },

    line_items: items.map((item) => {
      const itemPrice = item.selectedVariant?.price || item.product.price || 0;
      const variantInfo = item.selectedVariant
        ? ` (${item.selectedVariant.color || ""} / ${item.selectedVariant.size || ""})`
        : "";

      return {
        quantity: item.quantity,
        price_data: {
          currency: targetCurrency,
          unit_amount: Math.round(itemPrice * rate * 100),

          product_data: {
            name: `${item.product.name || "Unnamed Product"}${variantInfo}`,

            description: item.product.description || "",

            // Required for Managed Payments
            tax_code: "txcd_10000000",

            metadata: {
              id: item.product._id,
              variantSku: item.selectedVariant?.variantSku || "",
            },

            images:
              item.selectedVariant?.variantImage?.asset ||
              item.product.images?.length
                ? [
                    urlFor(
                      item.selectedVariant?.variantImage ||
                        item.product.images![0],
                    ).url(),
                  ]
                : [],
          },
        },
      };
    }),
  };

  if (customerId) {
    sessionPayload.customer = customerId;
  } else {
    sessionPayload.customer_email = metadata.customerEmail;
  }

  return sessionPayload;
}

export async function createCheckoutSession(
  items: CartItem[],
  metadata: Metadata,
  currency: string = DEFAULT_CURRENCY,
) {
  try {
    const sessionPayload = await buildSessionPayload(items, metadata, currency);

    const session = await stripe.checkout.sessions.create({
      ...sessionPayload,
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
      cancel_url: `${SITE_URL}/cart`,
    });

    return session.url;
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw error;
  }
}

export async function createWalletCheckoutSession(
  items: CartItem[],
  metadata: Metadata,
  currency: string = DEFAULT_CURRENCY,
) {
  try {
    const sessionPayload = await buildSessionPayload(items, metadata, currency);

    const session = await stripe.checkout.sessions.create({
      ...sessionPayload,
      // Embedded Elements mode powers the on-site Google Pay (Express
      // Checkout Element) button. The amount, currency, and line items are
      // still calculated server-side and cannot be manipulated by the client.
      ui_mode: "elements",
      return_url: `${SITE_URL}/success?orderNumber=${metadata.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    });

    return {
      clientSecret: session.client_secret,
      sessionId: session.id,
      orderNumber: metadata.orderNumber,
    };
  } catch (error) {
    console.error("Stripe Wallet Checkout Error:", error);
    throw error;
  }
}