import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { BagProvider } from "@/context/BagContext";
import BagDrawer from "@/components/ui/BagDrawer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Todi Creation",
  description: "Surat-based manufacturer of designer ethnic wear, sarees, and lehengas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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



