"use server";

import { createOrderInSanity, SanityOrderData } from "@/lib/orderService";
import { CartItem } from "@/store";
import { DEFAULT_CURRENCY } from "@/lib/currencyConfig";

export async function capturePayPalOrder(
  orderId: string,
  items: CartItem[],
  metadata: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId?: string;
    totalPrice: number;
    currency: string;
  }
) {
  try {
    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.NEXT_PUBLIC_PAYPAL_SECRET_ID}`
    ).toString("base64");

    // In a real production environment, you should call PayPal API to capture the order
    // Here we assume the capture is initiated from the client and we verify/process it here
    // or we can capture it directly from here if we have the orderId.
    
    // For this implementation, we will assume the capture was successful if we reached here from the client's onApprove
    // but ideally, you'd perform a server-side capture for maximum security.
    
    // Let's do a server-side capture for security.
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const data = await response.json();

    const currency = metadata.currency || DEFAULT_CURRENCY;

    if (data.status === "COMPLETED") {
    const sanityProducts = items.map((item) => ({
      _key: crypto.randomUUID(),
      product: {
        _type: "reference" as const,
        _ref: item.product._id,
      },
      quantity: item.quantity,
      selectedVariant: item.selectedVariant
        ? {
            color: item.selectedVariant.color,
            size: item.selectedVariant.size,
            variantSku: item.selectedVariant.variantSku,
            price: item.selectedVariant.price,
          }
        : undefined,
    }));

      const orderData: SanityOrderData = {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        clerkUserId: metadata.clerkUserId,
        totalPrice: metadata.totalPrice,
        currency,
        amountDiscount: 0,
        products: sanityProducts,
        status: "paid",
        paymentMethod: "paypal",
        paypalOrderId: orderId,
      };

      await createOrderInSanity(orderData);
      return { success: true };
    } else {
      throw new Error(`PayPal capture failed: ${data.status}`);
    }
  } catch (error) {
    console.error("PayPal Capture Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
