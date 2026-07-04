import React, { Suspense } from "react";
import ContactClient from "./ContactClient";
import { getContactConfig } from "@/lib/services/contactConfig";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export const metadata = {
  title: "Wholesale Inquiry & B2B Partner | Todi Creation",
  description: "Partner with Todi Creation for handcrafted bridal couture, premium festive collections, and exclusive boutique manufacturing.",
};

export default function ContactPage() {
  const config = getContactConfig();
  
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-screen flex flex-col items-center justify-center bg-ivory select-none">
            <div className="w-10 h-10 border-2 border-royal-maroon border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#B29567] font-heading">
              Loading B2B Inquiry...
            </span>
          </div>
        }>
          <ContactClient config={config} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
