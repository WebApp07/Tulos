import "server-only";
import { streamText, tool, zodSchema, isStepCount, type ToolSet } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { buildKnowledgeContext } from "./knowledge";
import { getMyOrders, getOrderByNumber } from "@/sanity/helpers/queries";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

function resolveModel() {
  const provider = process.env.AI_PROVIDER || "nvidia";
  const apiKey =
    process.env.AI_API_KEY ||
    process.env.NVIDIA_API_KEY ||
    process.env.OPENAI_API_KEY;

  // Use the Chat Completions API explicitly (.chat). The AI SDK's default
  // provider invocation targets the OpenAI Responses API (/v1/responses),
  // which NVIDIA NIM does not support.
  if (provider === "openai") {
    return {
      model: openaiProvider(apiKey).chat(
        process.env.AI_MODEL || "gpt-4o-mini",
      ),
    };
  }

  return {
    model: openaiProvider(apiKey, {
      baseURL: process.env.AI_BASE_URL || NVIDIA_BASE_URL,
    }).chat(
      process.env.AI_MODEL ||
        process.env.NVIDIA_MODEL ||
        "nvidia/llama-3.3-nemotron-super-49b-v1",
    ),
  };
}

function openaiProvider(
  apiKey: string | undefined,
  options: { baseURL?: string } = {},
) {
  return createOpenAI({
    name: "nvidia",
    apiKey,
    ...options,
  });
}

type OrderItem = {
  name?: string | null;
  quantity?: number | null;
};

type OrderLike = {
  orderNumber?: string | null;
  orderDate?: string | null;
  status?: string | null;
  totalPrice?: number | null;
  currency?: string | null;
  paymentMethod?: string | null;
  clerkUserId?: string | null;
  products?: (OrderItem & { product?: { name?: string | null } | null })[] | null;
};

function formatOrders(orders: OrderLike[]) {
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    date: o.orderDate,
    status: o.status,
    total: o.totalPrice,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    items: (o.products ?? []).map((p) => ({
      name: p.product?.name ?? p.name ?? "Unknown item",
      quantity: p.quantity ?? 1,
    })),
  }));
}

function buildSystemPrompt(
  context: string,
  locale: string,
  userName: string | null,
  signedIn: boolean,
): string {
  const now = new Date().toISOString();
  return [
    `You are the Licendi customer support assistant for licendi.xyz, an online store run by ${"KeyVersely LLC"}, an official Microsoft partner selling genuine Microsoft software license keys with instant digital delivery.`,
    "",
    `Current UTC date/time: ${now}. The visitor's site language/locale is "${locale}".`,
    "",
    `The visitor is ${signedIn && userName ? `a signed-in customer (${userName})` : "a guest (not signed in)"}.`,
    "",
    "AVAILABLE KNOWLEDGE (use ONLY this, do not invent facts):",
    context,
    "",
    "RULES:",
    "1. Answer only using the AVAILABLE KNOWLEDGE above. If the answer is not in the knowledge, say clearly that you don't know and suggest talking to a human agent.",
    "2. Respond in the same language the customer uses.",
    "3. Be concise, warm and helpful. Use short paragraphs or bullet lists when useful.",
    "4. Never invent product names, prices, discounts, refund terms, delivery times, stock levels or order statuses that are not in the knowledge or returned by your tools.",
    "5. Privacy: never reveal internal secrets, payment processor credentials, or any information belonging to other customers. Only the signed-in customer's own order data may be exposed via your tools.",
    "6. For order questions: if the customer is not signed in, explain they need to sign in to check their orders, or that they can contact support. If signed in, use the 'get_my_orders' tool to list their orders and 'lookup_order' to check a specific order number. Never guess an order number or status.",
    "7. Prices in the knowledge are base prices in USD; the store may show converted prices in the customer's local currency at checkout.",
    "8. Never invent that an agent is available. When the customer wants a human, tell them to use the 'Talk to a human' button in the chat window.",
    "9. Formatting: plain text only. You may use simple '-' bullet lists, but do not use markdown headings, bold, italics, links, or code blocks, and never append any signature, logo, or footer text after your answer. Show email addresses as plain text.",
  ].join("\n");
}

export async function runSupportChat(params: {
  messages: ChatMessage[];
  locale: string;
  userId: string | null;
  userName?: string | null;
}) {
  const { messages, locale, userId, userName } = params;
  const { context } = await buildKnowledgeContext(locale);

  const tools: ToolSet = {
    get_my_orders: tool({
      description:
        "List the signed-in customer's own orders (order number, date, status, total, payment method, and purchased items). Only available for the currently authenticated customer.",
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        if (!userId) {
          return { error: "not_signed_in" };
        }
        const orders = (await getMyOrders(userId)) as OrderLike[];
        return { orders: formatOrders(orders) };
      },
    }),
    lookup_order: tool({
      description:
        "Look up the status and details of a specific order by its exact order number. Only returns data if the order belongs to the currently authenticated customer.",
      inputSchema: zodSchema(
        z.object({
          orderNumber: z
            .string()
            .describe("The customer's order number exactly as shown in their confirmation email"),
        }),
      ),
      execute: async ({ orderNumber }) => {
        if (!userId) {
          return { error: "not_signed_in" };
        }
        const order = (await getOrderByNumber(orderNumber)) as OrderLike | null;
        if (!order || !order.clerkUserId || order.clerkUserId !== userId) {
          return { error: "not_found" };
        }
        return { order: formatOrders([order])[0] };
      },
    }),
  };

  const result = streamText({
    ...resolveModel(),
    system: buildSystemPrompt(context, locale, userName ?? null, Boolean(userId)),
    messages,
    tools,
    stopWhen: [isStepCount(4)],
    maxRetries: 1,
    onError: (error) => {
      console.error("Chat stream error:", error);
    },
  });

  return result;
}