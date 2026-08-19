import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  saveSupportConversation,
  type StoredMessage,
} from "@/lib/chat/storage";

const MAX_MESSAGES = 200;
const MAX_CONTENT_LENGTH = 2000;
const MAX_FIELD_LENGTH = 200;

const SOURCES = ["ai_chat", "live_chat", "offline_form"] as const;
type Source = (typeof SOURCES)[number];

type IncomingMessage = {
  role?: unknown;
  content?: unknown;
  createdAt?: unknown;
};

function sanitizeMessages(raw: unknown): StoredMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return null;
  }
  const cleaned: StoredMessage[] = [];
  for (const msg of raw as IncomingMessage[]) {
    const role = msg.role;
    const content = typeof msg.content === "string" ? msg.content.trim() : "";
    if (role !== "user" && role !== "assistant") {
      return null;
    }
    if (content.length === 0 || content.length > MAX_CONTENT_LENGTH) {
      return null;
    }
    cleaned.push({
      role,
      content,
      createdAt:
        typeof msg.createdAt === "string"
          ? msg.createdAt.slice(0, 32)
          : new Date().toISOString(),
    });
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  let body: {
    conversationId?: unknown;
    source?: unknown;
    messages?: unknown;
    customerName?: unknown;
    email?: unknown;
    subject?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const conversationId =
    typeof body.conversationId === "string"
      ? body.conversationId.trim().slice(0, 64)
      : "";
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const source = SOURCES.find((s) => s === body.source) as Source | undefined;
  if (!source) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
  }

  const clean = (value: unknown) =>
    typeof value === "string" ? value.trim().slice(0, MAX_FIELD_LENGTH) : "";

  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;

    const customerName =
      clean(body.customerName) ||
      user?.fullName ||
      user?.firstName ||
      user?.username ||
      "";

    const email = clean(body.email) || user?.primaryEmailAddress?.emailAddress || "";
    const subject = clean(body.subject) || "";

    await saveSupportConversation({
      conversationId,
      source,
      clerkUserId: userId,
      customerName: customerName || null,
      email: email || null,
      subject: subject || null,
      messages,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save support conversation:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}