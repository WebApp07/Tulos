import { buildMerchantFeed } from "@/lib/merchantFeed";

export const revalidate = 900;
export const dynamic = "force-static";

export async function GET() {
  const xml = await buildMerchantFeed();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=900, stale-while-revalidate=3600",
      "X-Robots-Tag": "all",
    },
  });
}