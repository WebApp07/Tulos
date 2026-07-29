import { backendClient } from "@/sanity/lib/backendClient";
import { defineQuery } from "next-sanity";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    const ORDER_BY_NUMBER_QUERY =
      defineQuery(`*[_type == 'order' && orderNumber == $orderNumber][0]{
      ...,products[]{
        ...,product->
      }
    }`);

    // Use backendClient to bypass any potential caching issues with live fetch
    const order = await backendClient.fetch(ORDER_BY_NUMBER_QUERY, { orderNumber });
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error in order API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
