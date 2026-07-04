import React, { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import CatalogContent from "./CatalogContent";
import CatalogSkeleton from "./CatalogSkeleton";

export const metadata: Metadata = {
  title: "Designer Lengha Catalog | Todi Creation",
  description: "Browse Todi Creation's premium bridal lenghas, Farsi trails, sider lenghas, and Indo-Western wear manufactured in Surat.",
};

// Enable Next.js instant static shell prerendering for client navigation
export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

interface PageProps {
  searchParams: Promise<{
    category?: string | string[];
    fabric?: string | string[];
    search?: string;
    sort?: string;
    featured?: string;
    newArrival?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal transition-colors duration-300">
      {/* Page Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full">
        {/* Suspense resolves the searchParams Promise on the server without blocking the instant static shell */}
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogContent searchParams={searchParams} />
        </Suspense>
      </main>

      {/* Page Footer */}
      <Footer />
    </div>
  );
}
