import "server-only";
import { backendClient } from "@/sanity/lib/backendClient";

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type SaveSupportConversationInput = {
  conversationId: string;
  source: "ai_chat" | "live_chat" | "offline_form";
  clerkUserId?: string | null;
  customerName?: string | null;
  email?: string | null;
  subject?: string | null;
  messages: StoredMessage[];
};

const DOC_ID_PREFIX = "supportConversation";

export async function saveSupportConversation(
  input: SaveSupportConversationInput,
) {
  const now = new Date().toISOString();
  const existing = await backendClient.fetch<{ _id: string } | null>(
    `*[_type == "supportConversation" && conversationId == $conversationId][0]{_id}`,
    { conversationId: input.conversationId },
  );

  if (existing?._id) {
    const updated = await backendClient
      .patch(existing._id)
      .set({
        updatedAt: now,
        status: "awaiting_agent",
        ...(input.customerName ? { customerName: input.customerName } : {}),
        ...(input.email ? { email: input.email } : {}),
        ...(input.subject ? { subject: input.subject } : {}),
      })
      .insert("after", "messages[-1]", input.messages)
      .commit();
    return updated;
  }

  const created = await backendClient.create({
    _id: `${DOC_ID_PREFIX}-${input.conversationId}`,
    _type: "supportConversation",
    conversationId: input.conversationId,
    source: input.source,
    status: "awaiting_agent",
    clerkUserId: input.clerkUserId ?? undefined,
    customerName: input.customerName ?? undefined,
    email: input.email ?? undefined,
    subject: input.subject ?? undefined,
    messages: input.messages,
    createdAt: now,
    updatedAt: now,
  });
  return created;
}