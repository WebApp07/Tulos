"use client";
import { useCurrency } from "./CurrencyProvider";
import { cn } from "@/lib/utils";
import React from "react";
interface Props {
  amount: number | undefined;
  className?: string;
  currency?: string;
}
const PriceFormatter = ({ amount, className, currency }: Props) => {
  const { currency: activeCurrency, rate, ready } = useCurrency();

  let formattedPrice: string;
  if (currency) {
    formattedPrice = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount ?? 0);
  } else if (ready) {
    const converted = (amount ?? 0) * rate;
    formattedPrice = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: 2,
    }).format(converted);
  } else {
    formattedPrice = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount ?? 0);
  }

  return (
    <span className={cn("text-sm font-semibold text-darkColor", className)}>
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;