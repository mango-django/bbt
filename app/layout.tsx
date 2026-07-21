// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header/Header";
import { CartProvider } from "@/app/context/CartContext";
import Footer from "@/components/Footer";
import CartToast from "@/components/CartToast";
import { Toaster } from "react-hot-toast";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Premium Bespoke Tiles, Delivered Across the UK`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // NOTE: no `alternates.canonical` here — a layout-level canonical cascades
  // to every page that doesn't set its own, pointing them all at the
  // homepage. Each page declares its own canonical instead.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Premium Bespoke Tiles, Delivered Across the UK`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_GB",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og-default.jpg"],
  },
};

// Site-wide structured data. Positioned as a premium ONLINE retailer (no
// physical showroom), so we use Organization + OnlineStore rather than
// LocalBusiness.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "OnlineStore"],
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  email: "sales@bellosbespoketiles.co.uk",
  telephone: "+44 7498 359060",
  areaServed: "GB",
  currenciesAccepted: "GBP",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+44 7498 359060",
      email: "sales@bellosbespoketiles.co.uk",
      areaServed: "GB",
      availableLanguage: "English",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <Header />
          <CartToast />

          {/* PAGE CONTENT */}
          <div className="flex-1">{children}</div>

          <Footer />

          {/* 🔔 GLOBAL TOAST PROVIDER */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
