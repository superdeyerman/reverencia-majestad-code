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

export const metadata: Metadata = {
  title: "Reverencia Majestad · Luxury Hair & Spa Mobile",
  description:
    "Plataforma premium para reservas beauty & wellness a domicilio y en hoteles de Santiago de Chile.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-sans min-h-screen bg-white text-stone-900 antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
