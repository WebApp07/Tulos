export const CURRENCY_BY_LOCALE: Record<string, string> = {
  en: "USD",
  fr: "EUR",
  de: "EUR",
  es: "EUR",
  it: "EUR",
  fi: "EUR",
  sv: "SEK",
};

export const CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc" },
];

export const DEFAULT_CURRENCY = "USD";
export const CURRENCY_STORAGE_KEY = "tulos-currency";