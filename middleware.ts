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

const PUBLIC_PATHS = new Set(["/sitemap.xml", "/robots.txt"]);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Static metadata / text assets must NEVER reach clerkHandler. Clerk's
  // internal middleware runs its dev-browser handshake redirect before the
  // callback fires, so even though handleGeoLocale() returns void for these
  // paths, the 307 redirect has already been issued by the time the callback
  // executes. Return NextResponse.next() unconditionally.
  if (PUBLIC_PATHS.has(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Every request, including bots/crawlers, must run through clerkMiddleware
  // so that Clerk's request-scoped auth context is available to server
  // components (Header calls auth()/currentUser()). Skipping Clerk for
  // crawler user agents made Clerk throw "auth() was called but Clerk can't
  // detect usage of clerkMiddleware()" on EVERY crawled page, causing 5xx for
  // Googlebot while browsers worked. Clerk only issues the dev-browser
  // handshake redirect when Clerk cookies/tokens are present; anonymous
  // crawler requests get a signed-out state and pass through untouched.
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
