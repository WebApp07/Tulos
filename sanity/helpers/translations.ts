import "server-only";
import { unstable_cache } from "next/cache";
import { defineQuery } from "next-sanity";
import { backendClient } from "@/sanity/lib/backendClient";

export const TRANSLATIONS_TAG = "translations";

const TRANSLATIONS_QUERY = defineQuery(
  `*[_type == 'translation' && locale == $locale]{ key, structured, value }`,
);

type TranslationDoc = {
  key: string;
  structured: boolean;
  value: string;
};

function setByPath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
) {
  const parts = path.split(".");
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof node[part] !== "object" || node[part] === null) {
      node[part] = {};
    }
    node = node[part] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];
    if (isPlainObject(value) && isPlainObject(baseValue)) {
      merged[key] = deepMerge(baseValue, value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function parseValue(doc: TranslationDoc): unknown {
  if (!doc.structured) return doc.value;
  try {
    return JSON.parse(doc.value);
  } catch {
    return doc.value;
  }
}

async function loadCmsMessages(locale: string) {
  const fallback = (await import(`../../messages/${locale}.json`))
    .default as Record<string, unknown>;

  let docs: TranslationDoc[] = [];
  try {
    docs = (await backendClient.fetch(TRANSLATIONS_QUERY, {
      locale,
    })) as TranslationDoc[];
  } catch (error) {
    console.error(
      `Failed to load CMS translations for "${locale}":`,
      error,
    );
  }

  const cms: Record<string, unknown> = {};
  for (const doc of docs) {
    setByPath(cms, doc.key.trim(), parseValue(doc));
  }

  return deepMerge(fallback, cms);
}

export const getCmsMessages = unstable_cache(
  async (locale: string) => loadCmsMessages(locale),
  ["cms-messages", "v1"],
  {
    tags: [TRANSLATIONS_TAG],
    revalidate: 60,
  },
);