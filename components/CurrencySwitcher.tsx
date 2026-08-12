"use client";
import { useState, useRef, useEffect } from "react";
import { Check, Coins } from "lucide-react";
import { useCurrency } from "./CurrencyProvider";

const CurrencySwitcher = () => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectCurrency = (code: string) => {
    setCurrency(code);
    setOpen(false);
  };

  return (
    <div
      ref={ref}
      className="relative"
      aria-label="Currency"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide hover:text-darkColor hoverEffect"
      >
        <Coins className="w-5 h-5" />
        <span className="hidden sm:inline">{currency}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-9 z-50 min-w-40 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl"
        >
          {availableCurrencies.map((c) => (
            <li key={c.code}>
              <button
                role="option"
                aria-selected={c.code === currency}
                onClick={() => selectCurrency(c.code)}
                className={`flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-lightBg ${
                  c.code === currency ? "text-darkColor" : "text-lightColor"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{c.symbol}</span>
                  <span>{c.code}</span>
                </span>
                {c.code === currency && (
                  <Check className="w-4 h-4 text-darkBlue" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrencySwitcher;