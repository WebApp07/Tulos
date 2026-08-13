import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/studio/",
        "/cart",
        "/orders",
        "/success",
        "/*/cart",
        "/*/orders",
        "/*/success",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}