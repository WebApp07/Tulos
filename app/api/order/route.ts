import { backendClient } from "@/sanity/lib/backendClient";
import { defineQuery } from "next-sanity";
import { NextRequest, NextResponse } from "next/server";
import { getCountryFromRequest } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    const GET_ORDER_BY_NUMBER_QUERY =
      defineQuery(`*[_type == 'order' && orderNumber == $orderNumber][0]{
      ...,products[]{
        ...,product->
      }
    }`);

    // Use backendClient to bypass any potential caching issues with live fetch
    const order = await backendClient.fetch(GET_ORDER_BY_NUMBER_QUERY, { orderNumber });

    // Geo-detected delivery country (ISO 3166-1 alpha-2), e.g. "US", "DE".
    // Licendi sells digital licenses, so no shipping address is collected at
    // checkout. The country comes from the same IP-geolocation headers
    // (x-vercel-ip-country / cf-ipcountry / x-country-code) that the
    // middleware already uses for currency and locale detection. It may be
    // null when no geo header is present (e.g. local development).
    const country = getCountryFromRequest(req);

    return NextResponse.json({ order, country });
  } catch (error) {
    console.error("Error in order API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
