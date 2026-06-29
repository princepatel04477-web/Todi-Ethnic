import React, { Suspense } from "react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import CatalogContent from "./CatalogContent";
import CatalogSkeleton from "./CatalogSkeleton";

// Enable Next.js instant static shell prerendering for client navigation
export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

interface PageProps {
  searchParams: Promise<{
    category?: string | string[];
    fabric?: string | string[];
    priceRange?: string | string[];
    search?: string;
    sort?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfcfa] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300">
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
