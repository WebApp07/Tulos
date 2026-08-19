import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createTextStreamResponse } from "ai";
import { runSupportChat, type ChatMessage } from "@/lib/chat/supportAgent";
import { routing } from "@/i18n/routing";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

type IncomingMessage = {
  role?: unknown;
  content?: unknown;
};

function asyncIterableToReadableStream<T>(
  iterable: AsyncIterable<T>,
): ReadableStream<T> {
  const iterator = iterable[Symbol.asyncIterator]();
  return new ReadableStream<T>({
    async pull(controller) {
      try {
        const { done, value } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      await iterator.return?.(reason);
    },
  });
}

function sanitizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }
  const cleaned: ChatMessage[] = [];
  for (const msg of raw as IncomingMessage[]) {
    const role = msg.role;
    const content =
      typeof msg.content === "string"
        ? msg.content.trim().slice(0, MAX_CONTENT_LENGTH)
        : "";
    if (role !== "user" && role !== "assistant") {
      return null;
    }
    if (content.length === 0) {
      continue;
    }
    cleaned.push({ role, content });
  }
  if (cleaned.length === 0) {
    return null;
  }
  const last = cleaned[cleaned.length - 1];
  if (last.role !== "user") {
    return null;
  }
  return cleaned.slice(-MAX_MESSAGES);
}

export async function POST(req: NextRequest) {
  if (
    !process.env.AI_API_KEY &&
    !process.env.NVIDIA_API_KEY &&
    !process.env.OPENAI_API_KEY
  ) {
    return NextResponse.json(
      { error: "Chat is not configured yet. Add your NVIDIA/OpenAI API key." },
      { status: 503 },
    );
  }

  let body: { messages?: unknown; locale?: unknown };
  try {
    body = (await req.json()) as { messages?: unknown; locale?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return NextResponse.json(
      { error: "Invalid messages payload" },
      { status: 400 },
    );
  }

  const locale =
    typeof body.locale === "string" &&
    routing.locales.includes(body.locale as (typeof routing.locales)[number])
      ? body.locale
      : "en";

  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    const userName = user?.fullName || user?.firstName || user?.username || null;

    const result = await runSupportChat({
      messages,
      locale,
      userId,
      userName,
    });

    return createTextStreamResponse({
      stream: asyncIterableToReadableStream(result.textStream),
    });
  } catch (error) {
    console.error("Chat request failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}