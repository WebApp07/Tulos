import { format } from "date-fns";
import { enUS, fr, de, es, it, fi, sv } from "date-fns/locale";

const dateLocales: Record<string, Locale> = {
  en: enUS,
  fr,
  de,
  es,
  it,
  fi,
  sv,
};

export function formatBlogDate(date: string | undefined, locale: string) {
  if (!date) return "";
  const loc = dateLocales[locale] || enUS;
  try {
    return format(new Date(date), "MMMM d, yyyy", { locale: loc });
  } catch {
    return "";
  }
}

export function calculateReadingTime(blocks: unknown[]): number {
  let words = 0;

  const walk = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value !== "object") return;
    const node = value as Record<string, unknown>;
    if (node._type === "span" && typeof node.text === "string") {
      words += node.text.split(/\s+/).filter(Boolean).length;
    }
    if (node.children) walk(node.children);
  };

  walk(blocks);
  return Math.max(1, Math.round(words / 200));
}