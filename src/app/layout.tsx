import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Cinzel } from "next/font/google";
import { BagProvider } from "@/context/BagContext";
import BagDrawer from "@/components/ui/BagDrawer";
import CustomCursor from "@/components/ui/CustomCursor";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

import InitialWebLoader from "@/components/ui/InitialWebLoader";

export const metadata: Metadata = {
  title: "Todi Creation | Wholesale Ethnic Wear & Bridal Lehenga Manufacturer",
  description: "B2B manufacturer and exporter of premium bridal lehengas, Farsi trails, and designer ethnic wear. Based in Surat since 2011. Trusted by 1700+ boutique partners across 17+ countries.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${cinzel.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <BagProvider>
          <InitialWebLoader />
          <CustomCursor />
          {children}
          <Suspense fallback={null}>
            <BagDrawer />
          </Suspense>
        </BagProvider>
      </body>
    </html>
  );
}



