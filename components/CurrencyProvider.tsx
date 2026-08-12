"use client";

import {
  CURRENCY_BY_LOCALE,
  CURRENCIES,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
} from "@/lib/currencyConfig";
import { useLocale } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CurrencyContextValue {
  currency: string;
  rate: number;
  ready: boolean;
  setCurrency: (code: string) => void;
  availableCurrencies: typeof CURRENCIES;
  format: (amount: number, opts?: { convert?: boolean }) => string;
  convert: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  rate: 1,
  ready: true,
  setCurrency: () => {},
  availableCurrencies: CURRENCIES,
  format: (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: DEFAULT_CURRENCY,
    }).format(amount),
  convert: (amount) => amount,
});

function getStoredCurrency(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && CURRENCIES.some((c) => c.code === stored)) {
      return stored;
    }
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CURRENCY_STORAGE_KEY}=`));
    const cookieValue = cookie ? cookie.split("=")[1] : null;
    return cookieValue && CURRENCIES.some((c) => c.code === cookieValue)
      ? cookieValue
      : null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const defaultForLocale = CURRENCY_BY_LOCALE[locale] || DEFAULT_CURRENCY;
  const [override, setOverride] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOverride(getStoredCurrency());
  }, []);

  const currency =
    override || defaultForLocale || DEFAULT_CURRENCY;

  useEffect(() => {
    const controller = new AbortController();
    if (currency === DEFAULT_CURRENCY) {
      setRate(1);
      setReady(true);
      return () => controller.abort();
    }
    fetch(`/api/currency?locale=${encodeURIComponent(locale)}&currency=${encodeURIComponent(currency)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { rate?: number }) => {
        setRate(typeof data.rate === "number" ? data.rate : 1);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Failed to load exchange rate:", error);
        }
      })
      .finally(() => setReady(true));
    return () => controller.abort();
  }, [locale, currency]);

  const setCurrency = useCallback((code: string) => {
    if (!CURRENCIES.some((c) => c.code === code)) return;
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
      document.cookie = `${CURRENCY_STORAGE_KEY}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    } catch {
      // ignore storage errors
    }
    setOverride(code);
    setReady(false);
  }, []);

  const convert = useCallback(
    (usdAmount: number) => usdAmount * rate,
    [rate],
  );

  const format = useCallback(
    (amount: number, opts?: { convert?: boolean }) => {
      const shouldConvert = opts?.convert ?? true;
      const value = shouldConvert ? convert(amount) : amount;
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(value);
    },
    [locale, currency, convert],
  );

  const value = useMemo(
    () => ({
      currency,
      rate,
      ready,
      setCurrency,
      availableCurrencies: CURRENCIES,
      format,
      convert,
    }),
    [currency, rate, ready, setCurrency, format, convert],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}