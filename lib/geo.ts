import { defaultLocale, type Locale } from "@/i18n/routing";

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  US: "en",
  GB: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  CA: "en",
  ZA: "en",
  IN: "en",
  FR: "fr",
  BE: "fr",
  LU: "fr",
  MC: "fr",
  CH: "fr",
  DE: "de",
  AT: "de",
  LI: "de",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  IT: "it",
  FI: "fi",
  SE: "sv",
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  EU: "EUR",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  LU: "EUR",
  PT: "EUR",
  IE: "EUR",
  FI: "EUR",
  SE: "SEK",
  LI: "CHF",
  CH: "CHF",
  JP: "JPY",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
};

export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "SEK",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
];

export function countryToLocale(countryCode?: string | null): Locale {
  if (!countryCode) return defaultLocale;
  const code = countryCode.toUpperCase();
  return COUNTRY_TO_LOCALE[code] || defaultLocale;
}

export function countryToCurrency(countryCode?: string | null): string | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  const currency = COUNTRY_TO_CURRENCY[code];
  if (!currency) return null;
  return SUPPORTED_CURRENCIES.includes(currency) ? currency : null;
}

export function getCountryFromRequest(req: {
  headers: Headers | { get(name: string): string | null };
}): string | null {
  return (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    null
  );
}