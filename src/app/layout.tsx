import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { BagProvider } from "@/context/BagContext";
import BagDrawer from "@/components/ui/BagDrawer";
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

export const metadata: Metadata = {
  title: "Todi Creation",
  description: "Surat-based manufacturer of designer ethnic wear, bridal lenghas, and premium couture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <BagProvider>
          {children}
          <Suspense fallback={null}>
            <BagDrawer />
          </Suspense>
        </BagProvider>
      </body>
    </html>
  );
}



