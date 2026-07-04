"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, Search, X, RotateCcw } from "lucide-react";
import { Category } from "@/lib/services/products";
import FiltersDrawer from "@/components/ui/FiltersDrawer";

interface CatalogClientProps {
  categories: Category[];
  fabrics: string[];
  activeFilters: {
    category: string[];
    fabric: string[];
    sort: string;
    search: string;
    featured?: boolean;
    newArrival?: boolean;
  };
  productCount: number;
}

export default function CatalogClient({
  categories,
  fabrics,
  activeFilters,
  productCount,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [prevSearch, setPrevSearch] = useState(activeFilters.search);
  const [searchInput, setSearchInput] = useState(activeFilters.search);

  if (activeFilters.search !== prevSearch) {
    setPrevSearch(activeFilters.search);
    setSearchInput(activeFilters.search);
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Construct URL with updated search params
  const updateUrl = (updates: {
    category?: string[];
    fabric?: string[];
    sort?: string;
    search?: string | null;
    featured?: boolean | null;
    newArrival?: boolean | null;
  }) => {
    const params = new URLSearchParams();

    // Preserve/Update Search
    const searchVal = updates.search !== undefined ? updates.search : activeFilters.search;
    if (searchVal) {
      params.set("search", searchVal);
    }

    // Preserve/Update Categories
    const categoryVals = updates.category !== undefined ? updates.category : activeFilters.category;
    categoryVals.forEach((cat) => params.append("category", cat));

    // Preserve/Update Fabrics
    const fabricVals = updates.fabric !== undefined ? updates.fabric : activeFilters.fabric;
    fabricVals.forEach((fab) => params.append("fabric", fab));

    // Preserve/Update Sort
    const sortVal = updates.sort !== undefined ? updates.sort : activeFilters.sort;
    if (sortVal && sortVal !== "newest") {
      params.set("sort", sortVal);
    }

    // Preserve/Update Featured
    const featuredVal = updates.featured !== undefined ? updates.featured : activeFilters.featured;
    if (featuredVal) {
      params.set("featured", "true");
    }

    // Preserve/Update New Arrival
    const newArrivalVal = updates.newArrival !== undefined ? updates.newArrival : activeFilters.newArrival;
    if (newArrivalVal) {
      params.set("newArrival", "true");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateUrl({ search: "" });
  };

  const handleApplyFilters = (filters: {
    category: string[];
    fabric: string[];
    sort: string;
    featured?: boolean;
    newArrival?: boolean;
  }) => {
    updateUrl(filters);
  };

  const handleRemoveFilter = (type: "category" | "fabric" | "featured" | "newArrival", value?: string) => {
    if (type === "featured" || type === "newArrival") {
      updateUrl({ [type]: false });
    } else {
      const currentList = activeFilters[type] || [];
      const updatedList = currentList.filter((item) => item !== value);
      updateUrl({ [type]: updatedList });
    }
  };

  const handleClearAll = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const activeFiltersCount =
    activeFilters.category.length +
    activeFilters.fabric.length +
    (activeFilters.sort !== "newest" ? 1 : 0) +
    (activeFilters.featured ? 1 : 0) +
    (activeFilters.newArrival ? 1 : 0);

  return (
    <div className="space-y-6 select-none">
      {/* Floating Sticky Search & Filter Capsule */}
      <div className="sticky top-20 lg:top-24 z-30 w-full max-w-5xl mx-auto mt-4 mb-12 px-6 py-2 sm:py-3 bg-ivory/95 backdrop-blur-md border border-antique-gold/15 rounded-full shadow-luxury flex items-center justify-between gap-4 transition-all duration-300">
        {/* Search Left */}
        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-xs sm:max-w-md">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-transparent focus:outline-none text-sm font-body text-premium-brown placeholder-premium-brown/40 border-none rounded-none"
          />
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold" />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-premium-brown/60 hover:text-royal-maroon transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-antique-gold/15" />

        {/* Filters & Sort Right */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-transparent text-xs font-heading font-semibold tracking-widest uppercase text-royal-maroon hover:text-wine-red transition-colors active-press cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-royal-maroon text-[9px] font-bold text-warm-ivory">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={activeFilters.sort}
              onChange={(e) => updateUrl({ sort: e.target.value })}
              className="appearance-none bg-transparent pl-3 pr-8 py-2 text-xs font-heading font-semibold tracking-widest uppercase text-royal-maroon focus:outline-none cursor-pointer"
              aria-label="Sort products"
            >
              <option value="newest">New Arrivals</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <svg className="h-3 w-3 fill-current text-royal-maroon" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-antique-gold/10 pt-4 animate-fade-in">
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-premium-brown/60 mr-2">
            Active:
          </span>

          {/* Category badges */}
          {activeFilters.category.map((catSlug) => {
            const catName = categories.find((c) => c.slug === catSlug)?.name || catSlug;
            return (
              <span
                key={catSlug}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-warm-cream border border-antique-gold/15 text-xs font-body text-royal-maroon"
              >
                <span>Category: {catName}</span>
                <button
                  onClick={() => handleRemoveFilter("category", catSlug)}
                  className="p-0.5 rounded-none hover:bg-antique-gold/20 transition-colors cursor-pointer text-royal-maroon"
                  aria-label={`Remove category filter ${catName}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            );
          })}

          {/* Fabric badges */}
          {activeFilters.fabric.map((fabric) => (
            <span
              key={fabric}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-warm-cream border border-antique-gold/15 text-xs font-body text-royal-maroon"
            >
              <span>Fabric: {fabric}</span>
              <button
                onClick={() => handleRemoveFilter("fabric", fabric)}
                className="p-0.5 rounded-none hover:bg-antique-gold/20 transition-colors cursor-pointer text-royal-maroon"
                aria-label={`Remove fabric filter ${fabric}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {/* Featured badge */}
          {activeFilters.featured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warm-cream border border-antique-gold/15 text-xs font-body text-royal-maroon">
              <span>Featured Only</span>
              <button
                onClick={() => handleRemoveFilter("featured")}
                className="p-0.5 rounded-none hover:bg-antique-gold/20 transition-colors cursor-pointer text-royal-maroon"
                aria-label="Remove Featured filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* New Arrival badge */}
          {activeFilters.newArrival && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warm-cream border border-antique-gold/15 text-xs font-body text-royal-maroon">
              <span>New Arrivals Only</span>
              <button
                onClick={() => handleRemoveFilter("newArrival")}
                className="p-0.5 rounded-none hover:bg-antique-gold/20 transition-colors cursor-pointer text-royal-maroon"
                aria-label="Remove New Arrivals filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {/* Clear All button */}
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1 border border-dashed border-antique-gold/30 text-xs font-heading font-medium tracking-wider uppercase text-premium-brown/70 hover:text-royal-maroon hover:border-royal-maroon transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      )}

      {/* Product count indicator */}
      <div className="flex items-center justify-between text-xs text-premium-brown/65 font-body border-t border-antique-gold/10 pt-4">
        <span>Showing {productCount} {productCount === 1 ? "design" : "designs"}</span>
      </div>

      {/* Filters slide-out drawer */}
      <FiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        categories={categories}
        fabrics={fabrics}
        activeFilters={{
          category: activeFilters.category,
          fabric: activeFilters.fabric,
          sort: activeFilters.sort,
          featured: activeFilters.featured,
          newArrival: activeFilters.newArrival,
        }}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
