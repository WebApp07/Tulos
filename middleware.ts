import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import {
  countryToCurrency,
  countryToLocale,
  getCountryFromRequest,
} from "./lib/geo";
import { CURRENCY_STORAGE_KEY } from "./lib/currencyConfig";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const hasLocalePrefix = (pathname: string) =>
  routing.locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

const CRAWLER_PATTERN =
  /(bot|crawler|spider|slurp|google|bing|yandex|baidu|duckduckgo|facebook|twitter|linkedin|pinterest|semrush|ahrefs|dotbot|applebot|ia_archiver|msnbot|mediapartners|preview|headless|phantomjs|curl|wget|python|postman)/i;

const isCrawlerRequest = (req: NextRequest) =>
  CRAWLER_PATTERN.test(req.headers.get("user-agent") ?? "");

const handleGeoLocale = (req: NextRequest): NextResponse | void => {
  const { pathname, search } = req.nextUrl;
  if (
    pathname.startsWith("/studio") ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico"
  ) {
    return;
  }

  const country = getCountryFromRequest(req);
  const currency = countryToCurrency(country);
  const locale = countryToLocale(country);

  // First-time visitor (no locale in URL): redirect to geo-detected locale
  if (!hasLocalePrefix(pathname)) {
    const url = new URL(
      `/${locale}${pathname === "/" ? "" : pathname}${search}`,
      req.url,
    );
    const response = NextResponse.redirect(url);
    if (currency) {
      response.cookies.set(CURRENCY_STORAGE_KEY, currency, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  const response = intlMiddleware(req);
  if (currency && !req.cookies.get(CURRENCY_STORAGE_KEY)) {
    response.cookies.set(CURRENCY_STORAGE_KEY, currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
};

const clerkHandler = clerkMiddleware((_auth, req) => handleGeoLocale(req));

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Bots and crawlers (Googlebot, Bingbot, Google-InspectionTool, ...) must
  // never hit the Clerk dev-browser handshake redirect; serve the page
  // directly instead.
  if (isCrawlerRequest(req)) {
    return handleGeoLocale(req);
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
