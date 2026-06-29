import React from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { fetchProducts, fetchCategories, fetchFabrics } from "@/lib/services/products";
import ProductCard from "@/components/ui/ProductCard";
import CatalogClient from "./CatalogClient";

interface CatalogContentProps {
  searchParams: Promise<{
    category?: string | string[];
    fabric?: string | string[];
    priceRange?: string | string[];
    search?: string;
    sort?: string;
  }>;
}

// Helper to coerce parameter to array of strings safely
const getArrayParam = (param: string | string[] | undefined): string[] => {
  if (!param) return [];
  if (Array.isArray(param)) return param.filter(Boolean);
  return [param].filter(Boolean);
};

export default async function CatalogContent({ searchParams }: CatalogContentProps) {
  const resolvedParams = await searchParams;

  // Setup active filters configuration
  const activeFilters = {
    category: getArrayParam(resolvedParams.category),
    fabric: getArrayParam(resolvedParams.fabric),
    priceRange: getArrayParam(resolvedParams.priceRange),
    sort: typeof resolvedParams.sort === "string" ? resolvedParams.sort : "newest",
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : "",
  };

  // Fetch all filtered data concurrently
  const [products, categories, fabrics] = await Promise.all([
    fetchProducts(activeFilters),
    fetchCategories(),
    fetchFabrics(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header text */}
      <div className="text-center select-none">
        <span className="text-xs uppercase tracking-[0.25em] text-primary font-heading font-semibold mb-2.5 block">
          Our Collections
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-medium tracking-tight mb-4 text-neutral-950 dark:text-white leading-tight">
          Exquisite Handcrafted Sarees & Lehengas
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-body leading-relaxed max-w-2xl mx-auto font-light">
          Browse our premium catalog of Banarasi silks, bridal georgettes, and designer lehengas manufactured directly in Surat. Add styles to your inquiry bag to request detailed quotes.
        </p>
      </div>

      {/* Interactive Controls & Filters */}
      <CatalogClient
        categories={categories}
        fabrics={fabrics}
        activeFilters={activeFilters}
        productCount={products.length}
      />

      {/* Products Grid or Empty State */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-white dark:bg-zinc-950 rounded-2xl border border-neutral-100 dark:border-neutral-900 shadow-luxury max-w-xl mx-auto select-none animate-fade-in">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
            No Designs Found
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-body leading-relaxed mb-8 font-light">
            We couldn&apos;t find any active designs matching your selected search or filter criteria. Try clearing some filters or browsing the full catalog.
          </p>
          <Link
            href="/catalog"
            className="inline-flex px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-heading font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 active-press hover-glow"
          >
            Reset All Filters
          </Link>
        </div>
      )}
    </div>
  );
}
