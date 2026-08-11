"use server";

import stripe from "@/lib/stripe";
import { urlFor } from "@/sanity/lib/image";
import { CartItem } from "@/store";
import Stripe from "stripe";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
}

export async function createCheckoutSession(
  items: CartItem[],
  metadata: Metadata,
) {
  try {
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
        clerkUserId: metadata.clerkUserId,
      },

      allow_promotion_codes: true,

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,

      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,

      line_items: items.map((item) => {
        const itemPrice = item.selectedVariant?.price || item.product.price || 0;
        const variantInfo = item.selectedVariant
          ? ` (${item.selectedVariant.color || ""} / ${item.selectedVariant.size || ""})`
          : "";

        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(itemPrice * 100),

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

    const session = await stripe.checkout.sessions.create(sessionPayload);

    return session.url;
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    throw error;
  }
}
