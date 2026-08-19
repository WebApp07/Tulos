import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { routing, type Locale } from "@/i18n/routing";

type ProductKnowledge = {
  name: string;
  slug: string;
  brand?: string | null;
  brandName?: string | null;
  intro?: string | null;
  osType?: string | null;
  operatingSystemsSupported?: string | null;
  versionType?: string | null;
  price?: number | null;
  discount?: number | null;
  stock?: number | null;
  status?: string | null;
  productStatus?: string | null;
  warranty?: string | null;
  deliveryTime?: string | null;
  packageInclude?: string | null;
  activation?: string | null;
  support?: string | null;
};

const PRODUCTS_FOR_KNOWLEDGE_QUERY = defineQuery(
  `*[_type == "product"] | order(name asc){
    name,
    slug,
    brand,
    brandName,
    intro,
    osType,
    operatingSystemsSupported,
    versionType,
    price,
    discount,
    stock,
    status,
    productStatus,
    warranty,
    deliveryTime,
    packageInclude,
    activation,
    support
  }`,
);

export async function getProductKnowledge(): Promise<ProductKnowledge[]> {
  try {
    const result = await sanityFetch({
      query: PRODUCTS_FOR_KNOWLEDGE_QUERY,
    });
    const products = (result?.data ?? []) as ProductKnowledge[];
    return products.filter((p) => p.name);
  } catch (error) {
    console.error("Error fetching product knowledge:", error);
    return [];
  }
}

type StaticKnowledge = {
  faqItems: { q: string; a: string }[];
  refundSections: { heading?: string; body?: string }[];
  shippingSections: { heading?: string; body?: string }[];
  contactEmail?: string;
  contactHours?: string;
  contactCompany?: string;
};

function pickStaticKnowledge(raw: Record<string, unknown>): StaticKnowledge {
  const faqs = (raw.faqs as { items?: { q?: string; a?: string }[] }) ?? {};
  const refundPolicy = (raw.refundPolicy as {
    sections?: { heading?: string; body?: string }[];
  }) ?? {};
  const shippingPolicy = (raw.shippingPolicy as {
    sections?: { heading?: string; body?: string }[];
  }) ?? {};
  const contact = (raw.contact as Record<string, string>) ?? {};

  return {
    faqItems: (faqs.items ?? []).map((i) => ({
      q: i.q ?? "",
      a: i.a ?? "",
    })),
    refundSections: (refundPolicy.sections ?? []).map((s) => ({
      heading: s.heading,
      body: s.body,
    })),
    shippingSections: (shippingPolicy.sections ?? []).map((s) => ({
      heading: s.heading,
      body: s.body,
    })),
    contactEmail: contact.emailValue,
    contactHours: contact.hoursValue,
    contactCompany: contact.companyName,
  };
}

export async function getStaticKnowledge(
  locale: string,
): Promise<StaticKnowledge> {
  const safeLocale = routing.locales.includes(locale as Locale) ? locale : "en";
  try {
    const file = await readFile(
      path.join(process.cwd(), "messages", `${safeLocale}.json`),
      "utf8",
    );
    return pickStaticKnowledge(JSON.parse(file) as Record<string, unknown>);
  } catch (error) {
    console.error("Error reading static knowledge:", error);
    return {
      faqItems: [],
      refundSections: [],
      shippingSections: [],
    };
  }
}

function productLine(p: ProductKnowledge): string {
  const parts = [
    p.name,
    p.slug ? `slug:${p.slug}` : "",
    p.brandName || p.brand ? `brand:${p.brandName || p.brand}` : "",
    p.osType ? `type:${p.osType}` : "",
    p.operatingSystemsSupported
      ? `os:${p.operatingSystemsSupported}`
      : "",
    p.versionType ? `version:${p.versionType}` : "",
    typeof p.price === "number" ? `basePriceUSD:$${p.price}` : "",
    typeof p.discount === "number" && p.discount > 0
      ? `discount:${p.discount}%`
      : "",
    typeof p.stock === "number" ? `stock:${p.stock}` : "",
    p.status ? `flag:${p.status}` : "",
    p.productStatus ? `productStatus:${p.productStatus}` : "",
    p.warranty ? `warranty:${p.warranty}` : "",
    p.deliveryTime ? `delivery:${p.deliveryTime}` : "",
    p.packageInclude ? `includes:${p.packageInclude}` : "",
    p.activation ? `activation:${p.activation}` : "",
    p.support ? `support:${p.support}` : "",
    p.intro ? `intro:${p.intro}` : "",
  ].filter(Boolean);
  return parts.join(" | ");
}

export async function buildKnowledgeContext(locale: string): Promise<{
  context: string;
  productCount: number;
}> {
  const [products, staticKnowledge] = await Promise.all([
    getProductKnowledge(),
    getStaticKnowledge(locale),
  ]);

  const sections: string[] = [];

  sections.push(
    `STORE: Licendi (licendi.xyz) is run by ${staticKnowledge.contactCompany || "KeyVersely LLC"}, an official Microsoft partner. Store prices are set in USD and may be displayed in a different currency depending on the visitor's location; the exact price is always shown on the product page and at checkout.`,
  );

  sections.push(
    `PAYMENT METHODS ACCEPTED: Stripe (credit/debit card), PayPal, and Google Pay.`,
  );

  const supportEmail =
    process.env.SUPPORT_EMAIL?.trim() ||
    staticKnowledge.contactEmail ||
    "support@keyversely.com";

  sections.push(
    `CONTACT: support email ${supportEmail}. Support hours: ${staticKnowledge.contactHours || "business hours, replies usually within 24 hours"}.`,
  );

  if (staticKnowledge.faqItems.length > 0) {
    sections.push(
      `FAQ:\n${staticKnowledge.faqItems
        .map((i, idx) => `${idx + 1}. Q: ${i.q}\n   A: ${i.a}`)
        .join("\n")}`,
    );
  }

  if (staticKnowledge.shippingSections.length > 0) {
    sections.push(
      `SHIPPING & DELIVERY POLICY:\n${staticKnowledge.shippingSections
        .map((s) => `${s.heading || ""}: ${s.body || ""}`)
        .join("\n")}`,
    );
  }

  if (staticKnowledge.refundSections.length > 0) {
    sections.push(
      `REFUND & RETURNS POLICY:\n${staticKnowledge.refundSections
        .map((s) => `${s.heading || ""}: ${s.body || ""}`)
        .join("\n")}`,
    );
  }

  if (products.length > 0) {
    sections.push(
      `PRODUCT CATALOG (${products.length} products, base price in USD):\n${products
        .map((p) => `- ${productLine(p)}`)
        .join("\n")}`,
    );
  }

  return {
    context: sections.join("\n\n"),
    productCount: products.length,
  };
}