import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { BagProvider } from "@/context/BagContext";
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
        <BagProvider>{children}</BagProvider>
      </body>
    </html>
  );
}

