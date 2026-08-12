import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { createOrderInSanity, SanityOrderData } from "@/lib/orderService";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      {
        error: "No Signature",
      },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_KEY;

  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json(
      {
        error: "Stripe webhook secret is not set",
      },
      { status: 400 },
    );
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      {
        error: `Webhook Error: ${error}`,
      },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Processing checkout.session.completed for session:", session.id);

    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    // Fetch Payment Intent to get receipt_url if invoice is not available
    let paymentIntent = null;
    if (session.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );
    }

    try {
      const order = await saveOrder(session, invoice, paymentIntent);
      console.log("Successfully created order in Sanity:", order._id);
    } catch (error) {
      console.error("Error creating order in sanity:", error);
      // Log more details about the failure
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return NextResponse.json(
        {
          error: `Error creating order: ${error}`,
        },
        { status: 400 },
      );
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }
  return NextResponse.json({ received: true });
}

async function saveOrder(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null,
  paymentIntent: Stripe.PaymentIntent | null,
) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    total_details,
  } = session;
  const { orderNumber, customerName, customerEmail, clerkUserId } =
    metadata as unknown as Metadata;

  console.log("Metadata received in webhook:", { orderNumber, customerName, customerEmail, clerkUserId });

  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(
    id,
    { expand: ["data.price.product"] },
  );

    const sanityProducts = lineItemsWithProduct.data.map((item) => {
      const productMetadata = (item.price?.product as Stripe.Product)?.metadata;
      const productId = productMetadata?.id;
      const variantSku = productMetadata?.variantSku;
      if (!productId) {
        console.warn(
          `Product ID missing in Stripe metadata for item: ${item.id}`,
          {
            price: item.price,
            product: item.price?.product,
          },
        );
      }
      return {
        _key: crypto.randomUUID(),
        product: {
          _type: "reference" as const,
          _ref: productId,
        },
        quantity: item?.quantity || 0,
        selectedVariant: variantSku ? { variantSku } : undefined,
      };
    });

  console.log("Creating order in Sanity with products:", JSON.stringify(sanityProducts));

  try {
    const orderData: SanityOrderData = {
      orderNumber: orderNumber || `UNK-${Date.now()}`,
      customerName: customerName || "Unknown",
      customerEmail: customerEmail || "unknown",
      clerkUserId: clerkUserId || "unknown",
      totalPrice: amount_total ? amount_total / 100 : 0,
      currency: currency || "usd",
      amountDiscount: total_details?.amount_discount
        ? total_details?.amount_discount / 100
        : 0,
      products: sanityProducts,
      status: "paid",
      paymentMethod: "stripe",
      stripeCheckoutSessionId: id,
      stripePaymentIntentId: typeof payment_intent === "string" 
        ? payment_intent 
        : payment_intent?.id || "none",
      receiptUrl: paymentIntent?.latest_charge
        ? ((await stripe.charges.retrieve(
            paymentIntent.latest_charge as string,
          )) as Stripe.Charge).receipt_url || undefined
        : undefined,
      invoice: invoice
        ? {
            id: invoice.id,
            number: invoice.number || "",
            hosted_invoice_url: invoice.hosted_invoice_url || "",
          }
        : undefined,
    };

    const order = await createOrderInSanity(orderData);
    return order;
  } catch (error) {
    console.error("Critical error in createOrderInSanity:", error);
    throw error;
  }
}
