import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-serif",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const APP_URL = process.env.APP_URL ?? "https://reverenciamajestad.cl";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Reverencia Majestad · Luxury Hair & Spa Mobile",
    template: "%s | Reverencia Majestad",
  },
  description:
    "Plataforma premium de belleza y bienestar a domicilio y en hoteles de Santiago de Chile. Profesionales certificados, productos de primera línea, agenda en línea.",
  keywords: [
    "hair salon a domicilio Santiago",
    "spa a domicilio Santiago",
    "beauty a domicilio Chile",
    "extensiones a domicilio",
    "masaje a domicilio Santiago",
    "wellness in-room hotel Santiago",
    "colorimetria a domicilio",
    "facial a domicilio Santiago",
    "reverencia majestad",
  ],
  authors: [{ name: "Reverencia Majestad" }],
  creator: "Reverencia Majestad",
  publisher: "Reverencia Majestad",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: APP_URL,
    siteName: "Reverencia Majestad",
    title: "Reverencia Majestad · Luxury Hair & Spa Mobile",
    description:
      "Profesionales de hair & spa certificados que llegan a tu hogar o habitación de hotel en Santiago. Sin desplazamientos, con experiencia de lujo.",
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Reverencia Majestad — Luxury Hair & Spa Mobile Santiago",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reverencia Majestad · Luxury Hair & Spa Mobile",
    description: "Hair & spa a domicilio y en hoteles de Santiago. Reserva online.",
    images: ["/images/og-default.svg"],
  },
  alternates: {
    canonical: APP_URL,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              name: "Reverencia Majestad",
              description: "Plataforma premium de belleza y bienestar a domicilio y en hoteles de Santiago.",
              url: APP_URL,
              telephone: "+56963929354",
              email: "reverenciamajestad@gmail.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Santiago",
                addressCountry: "CL",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -33.4372,
                longitude: -70.6506,
              },
              openingHours: "Mo-Su 09:00-20:00",
              priceRange: "$$$$",
              servesCuisine: [],
              hasMap: `https://maps.google.com/?q=Santiago+Chile`,
              sameAs: [
                "https://instagram.com/reverenciamajestad",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans min-h-screen bg-white text-stone-900 antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
