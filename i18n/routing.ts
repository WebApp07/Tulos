import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "de", "es"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
export const defaultLocale = routing.defaultLocale;
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};