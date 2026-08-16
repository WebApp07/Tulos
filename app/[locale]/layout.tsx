import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import { PayPalProvider } from "@/components/PayPalProvider";
import { NextIntlClientProvider } from "next-intl";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { getMessages } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1 307 785 6160",
    contactType: "customer service",
    email: "support@keyversely.com",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "63 N Burritt Ave Rm 100 Pmb 1180",
    addressLocality: "Buffalo",
    addressRegion: "Wyoming",
    postalCode: "82834",
    addressCountry: "US",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: routing.locales,
};

const raleway = localFont({
  src: "../fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Licendi – Official Microsoft Software Licensing",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop genuine Microsoft software licenses, download keys and instant digital delivery from an official Microsoft partner.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const localeTyped = locale as Locale;

  setRequestLocale(localeTyped);
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale}>
        <head>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-L4NFYPPLS3"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-L4NFYPPLS3');
              `,
            }}
          />
        </head>
        <body className={`${raleway.variable} antialiased`}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteJsonLd),
            }}
          />
          <NextIntlClientProvider messages={messages}>
            <CurrencyProvider>
              <PayPalProvider>
                <Header />
                {children}
                <Footer />
                <CookieConsent />
              </PayPalProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#000000",
                    color: "#ffffff",
                  },
                }}
              />
            </CurrencyProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}