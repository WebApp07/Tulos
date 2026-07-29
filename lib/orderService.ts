import { backendClient } from "@/sanity/lib/backendClient";
import { Metadata } from "@/actions/createCheckoutSession";

export interface SanityOrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
  totalPrice: number;
  currency: string;
  amountDiscount: number;
  products: {
    _key: string;
    product: {
      _type: "reference";
      _ref: string;
    };
    quantity: number;
  }[];
  paymentMethod: "stripe" | "paypal";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  status: "paid" | "pending";
}

export async function createOrderInSanity(orderData: SanityOrderData) {
  try {
    const order = await backendClient.create({
      _type: "order",
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      clerkUserId: orderData.clerkUserId,
      email: orderData.customerEmail,
      currency: orderData.currency,
      amountDiscount: orderData.amountDiscount,
      products: orderData.products,
      totalPrice: orderData.totalPrice,
      status: orderData.status,
      orderDate: new Date().toISOString(),
      // Flexible fields based on payment method
      ...(orderData.paymentMethod === "stripe" && {
        stripeCheckoutSessionId: orderData.stripeCheckoutSessionId,
        stripePaymentIntentId: orderData.stripePaymentIntentId,
      }),
      ...(orderData.paymentMethod === "paypal" && {
        paypalOrderId: orderData.paypalOrderId,
      }),
    });
    return order;
  } catch (error) {
    console.error("Error creating order in Sanity:", error);
    throw error;
  }
}
