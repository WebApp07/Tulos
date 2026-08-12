import "server-only";
import { unstable_cache } from "next/cache";

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";

async function googleTranslate(text: string, target: string): Promise<string> {
  if (!text) return text;
  const url = `${ENDPOINT}?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Translation failed with status ${res.status}`);
  }
  const data = (await res.json()) as Array<Array<[string]>>;
  return data[0]
    .map((segment) => segment?.[0] ?? "")
    .join("");
}

export const translateProductField = unstable_cache(
  async (field: string, text: string, target: string) => {
    try {
      const translated = await googleTranslate(text, target);
      return translated || text;
    } catch (error) {
      console.error(`Failed to translate ${field}:`, error);
      return text;
    }
  },
  ["product-translation", "v1"],
  {
    revalidate: 60 * 60 * 24,
  },
);

export const translateText = unstable_cache(
  async (text: string, target: string) => {
    try {
      const translated = await googleTranslate(text, target);
      return translated || text;
    } catch (error) {
      console.error(`Failed to translate "${text}":`, error);
      return text;
    }
  },
  ["text-translation", "v1"],
  {
    revalidate: 60 * 60 * 24,
  },
);