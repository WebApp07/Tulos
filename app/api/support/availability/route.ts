import { NextResponse } from "next/server";

export async function GET() {
  const available = process.env.SUPPORT_AVAILABLE === "true";
  return NextResponse.json({ available });
}