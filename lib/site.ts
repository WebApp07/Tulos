import { routing } from "@/i18n/routing";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://licendi.xyz"
).replace(/\/+$/, "");

export const SITE_NAME = "Licendi";

export function localizedUrl(locale: string, path: string): string {
  const suffix = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${locale}${suffix}`;
}

export function hreflangAlternates(path: string): Record<string, string> {
  const suffix = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}/${locale}${suffix}`;
  }
  languages["x-default"] = `${SITE_URL}/en${suffix}`;
  return languages;
}
