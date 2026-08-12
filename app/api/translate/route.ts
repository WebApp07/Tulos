import { translateText } from "@/lib/translate";
import { NextRequest, NextResponse } from "next/server";

const REQUEST_LIMIT = 100;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    texts: string[];
    locale: string;
  };
  const texts = Array.isArray(body?.texts) ? body.texts.slice(0, REQUEST_LIMIT) : [];
  const locale = body?.locale;

  if (!locale) {
    return NextResponse.json({ error: "Missing locale" }, { status: 400 });
  }

  const translated = await Promise.all(
    texts.map((text) => translateText(text, locale)),
  );

  return NextResponse.json({ translated });
}