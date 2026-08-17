"use client";

import { useEffect, useRef } from "react";

/**
 * Google Customer Reviews survey opt-in module.
 *
 * Loads Google's platform script and renders the opt-in ONLY on the order
 * confirmation (success) page and ONLY for genuinely completed (paid) orders
 * that have every value Google requires:
 *
 *   - merchant_id              fixed Licendi Merchant Center ID
 *   - order_id                 real Sanity order number from the order document
 *   - email                    real customer email from the order document
 *   - delivery_country         ISO 3166-1 alpha-2 code from IP-geolocation
 *                              headers (no shipping address is collected for
 *                              digital delivery)
 *   - estimated_delivery_date  real order date (YYYY-MM-DD): Licendi delivers
 *                              digital license keys by email instantly at
 *                              purchase time, so the order date is the date the
 *                              digital goods are delivered/consumed
 *
 * Safety rules implemented here:
 *   - never renders for missing order / email / country / date
 *   - never renders for unpaid (pending/cancelled) orders
 *   - never renders twice in the same page load (StrictMode safe)
 *   - Google script is injected dynamically on this page only, never globally
 *   - GTINs: Licendi's product catalog does not store GTIN/EAN/UPC data.
 *     Google's rules forbid substituting SKUs, Sanity _ids, slugs, or license
 *     keys as GTINs, so the `products` array is populated ONLY from a real,
 *     format-valid GTIN if the order data ever contains one. Today that never
 *     happens, so `products` is omitted.
 */

const MERCHANT_ID = 5839734294;

const PLATFORM_SCRIPT_URL =
  "https://apis.google.com/js/platform.js?onload=renderOptIn";

// GTIN-8, GTIN-12 (UPC-A), GTIN-13 (EAN-13), GTIN-14 are 8, 12, 13, or 14 digits.
const GTIN_RE = /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/;

// ISO 3166-1 alpha-2 country code, e.g. "US". Google rejects "ZZ" and other
// non-alpha-2 values, so only a plain 2-letter code passes this check.
const COUNTRY_RE = /^[A-Za-z]{2}$/;

interface GoogleCustomerReviewsOptInProps {
  order: {
    orderNumber?: string;
    email?: string;
    status?: string;
    orderDate?: string;
    products?: Array<{ product?: { gtin?: string } }>;
  } | null;
  country: string | null;
}

function isValidGtin(value: unknown): value is string {
  return typeof value === "string" && GTIN_RE.test(value.trim());
}

function toYYYYMMDD(isoDate: string): string | null {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface GapiLike {
  load?: (name: string, callback: () => void) => void;
}

export default function GoogleCustomerReviewsOptIn({
  order,
  country,
}: GoogleCustomerReviewsOptInProps) {
  // Prevents duplicate render calls within a single page load (React 18/19
  // StrictMode double-invokes effects in development).
  const rendered = useRef(false);

  useEffect(() => {
    if (!order) return;

    // Only genuinely completed orders get the opt-in. Orders are created in
    // Sanity with status "paid" after Stripe/PayPal payment confirmation, so
    // pending/cancelled/failed orders never reach this point.
    if (order.status !== "paid") return;

    const orderId = order.orderNumber?.trim();
    const email = order.email?.trim();
    const deliveryCountry = country?.trim().toUpperCase();
    const estimatedDeliveryDate = order.orderDate
      ? toYYYYMMDD(order.orderDate)
      : null;

    // Google requires all five parameters. Missing or invalid data (for
    // example, no geo header is available) is a silent no-op: the confirmation
    // page keeps working exactly as before and no opt-in is shown.
    if (
      !orderId ||
      !email ||
      !deliveryCountry ||
      !COUNTRY_RE.test(deliveryCountry) ||
      !estimatedDeliveryDate
    ) {
      return;
    }

    if (rendered.current) return;
    rendered.current = true;

    // Real GTINs only. No GTIN data exists in the catalog today, so this
    // resolves to an empty list and `products` is omitted from the payload.
    const gtins = (order.products ?? [])
      .map((item) => item.product?.gtin)
      .filter(isValidGtin)
      .map((gtin) => gtin.trim());
    const productsPayload =
      gtins.length > 0 ? { products: gtins.map((gtin) => ({ gtin })) } : {};

    const renderOptIn = () => {
      try {
        const gapi = (window as unknown as { gapi?: GapiLike }).gapi;
        if (!gapi?.load) return;

        gapi.load("surveyoptin", () => {
          const surveyoptin = (
            window as unknown as {
              gapi?: { surveyoptin?: { render: (opts: unknown) => void } };
            }
          ).gapi?.surveyoptin;
          if (!surveyoptin?.render) return;

          surveyoptin.render({
            merchant_id: MERCHANT_ID,
            order_id: orderId,
            email,
            delivery_country: deliveryCountry,
            estimated_delivery_date: estimatedDeliveryDate,
            ...productsPayload,
          });
        });
      } catch (error) {
        // The opt-in must never break the confirmation page.
        console.warn("Google Customer Reviews opt-in failed:", error);
      }
    };

    // Google's platform script invokes this global via ?onload=renderOptIn.
    (window as unknown as { renderOptIn?: () => void }).renderOptIn =
      renderOptIn;

    // Load the Google script only from this page (never in the global layout)
    // and only once per page load.
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="apis.google.com/js/platform.js"]',
    );

    if (existingScript && (window as unknown as { gapi?: unknown }).gapi) {
      // Already loaded (e.g. SPA navigation back to the success page).
      renderOptIn();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.src = PLATFORM_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.warn("Google Customer Reviews platform script failed to load");
      };
      document.head.appendChild(script);
    }
    // If the script tag exists but has not finished loading, its onload
    // handler calls the window.renderOptIn defined above once it arrives.
  }, [order, country]);

  return null;
}
