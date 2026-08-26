import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/site";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  siteGraphJsonLd,
} from "@/lib/seo";
import { Geist, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageViewTracker } from "@/components/PageViewTracker";
import { JsonLd } from "@/components/JsonLd";
import { Suspense } from "react";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/brand/logo-mark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/logo-mark-64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/logo-mark-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/brand/logo-mark-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/brand/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Extensions (ColorZilla, Grammarly, …) mutate <body> before hydration; ignore those attrs. */}
      <body
        suppressHydrationWarning
        className={`${geist.variable} ${display.variable} flex min-h-screen flex-col antialiased`}
      >
        <JsonLd data={siteGraphJsonLd()} />
        <AuthProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <Nav />
          <main className="flex-1 pb-16 pt-6 md:pt-8">{children}</main>
          <Footer />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
