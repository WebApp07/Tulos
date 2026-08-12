import "server-only";
import { unstable_cache } from "next/cache";
import { DEFAULT_CURRENCY } from "./currencyConfig";

async function fetchRates() {
  const res = await fetch("https://open.er-api.com/v6/latest/USD", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch exchange rates: ${res.status}`);
  }
  const data = (await res.json()) as {
    rates?: Record<string, number>;
  };
  return data.rates ?? {};
}

export const getExchangeRates = unstable_cache(
  async () => fetchRates(),
  ["exchange-rates", "v1"],
  {
    revalidate: 3600,
  },
);

export async function getExchangeRate(currency: string): Promise<number> {
  if (!currency || currency === DEFAULT_CURRENCY) return 1;
  const rates = await getExchangeRates();
  return rates[currency] ?? 1;
}

export function convertUsdTo(
  usdAmount: number,
  currency: string,
  rate: number,
): number {
  return usdAmount * rate;
}