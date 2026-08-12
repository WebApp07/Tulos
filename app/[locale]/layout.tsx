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

const raleway = localFont({
  src: "../fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Licendi – Official Microsoft Software Licensing",
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
        <body className={`${raleway.variable} antialiased`}>
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