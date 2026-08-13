import { revalidatePath, revalidateTag } from "next/cache";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { TRANSLATIONS_TAG } from "@/sanity/helpers/translations";

const SECRET = process.env.SANITY_WEBHOOK_SECRET;

function isValidSignature(signature: string | null, rawBody: string) {
  if (!SECRET) return true;
  if (!signature) return false;

  // Sanity sends a svix-style header: "t=<timestamp>,v1=<hex>"
  const parts = Object.fromEntries(
    signature.split(",").map((part) => part.split("=") as [string, string]),
  ) as { t: string; v1: string };

  const expected = createHmac("sha256", SECRET)
    .update(`${parts.t}.${rawBody}`)
    .digest("hex");

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("sanity-webhook-signature");

  if (!isValidSignature(signature, rawBody)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  revalidateTag(TRANSLATIONS_TAG);
  revalidateTag("sanity");
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog", "layout");
  return NextResponse.json({ revalidated: true });
}