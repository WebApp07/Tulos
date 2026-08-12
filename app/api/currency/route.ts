import {
  CURRENCY_BY_LOCALE,
  DEFAULT_CURRENCY,
} from "@/lib/currencyConfig";
import { getExchangeRate } from "@/lib/currency";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") || undefined;
  const requested = req.nextUrl.searchParams.get("currency") || undefined;
  const currency =
    (requested && requested.toUpperCase()) ||
    (locale && CURRENCY_BY_LOCALE[locale]) ||
    DEFAULT_CURRENCY;
  const rate = await getExchangeRate(currency);

  return NextResponse.json({ currency, rate });
}