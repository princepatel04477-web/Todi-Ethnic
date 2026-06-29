"use client";

import React, { useState, useEffect } from "react";
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
    priceRange: string[];
    sort: string;
    search: string;
  };
  productCount: number;
}

const priceRangeLabels: Record<string, string> = {
  "0-5000": "Under ₹5,000",
  "5000-10000": "₹5,000 - ₹10,000",
  "10000-15000": "₹10,000 - ₹15,000",
  "15000-20000": "₹15,000 - ₹20,000",
  "20000+": "₹20,000 & Above",
};

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
    priceRange?: string[];
    sort?: string;
    search?: string | null;
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

    // Preserve/Update Price Ranges
    const priceVals = updates.priceRange !== undefined ? updates.priceRange : activeFilters.priceRange;
    priceVals.forEach((price) => params.append("priceRange", price));

    // Preserve/Update Sort
    const sortVal = updates.sort !== undefined ? updates.sort : activeFilters.sort;
    if (sortVal && sortVal !== "newest") {
      params.set("sort", sortVal);
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
    priceRange: string[];
    sort: string;
  }) => {
    updateUrl(filters);
  };

  const handleRemoveFilter = (type: "category" | "fabric" | "priceRange", value: string) => {
    const currentList = activeFilters[type];
    const updatedList = currentList.filter((item) => item !== value);
    updateUrl({ [type]: updatedList });
  };

  const handleClearAll = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const activeFiltersCount =
    activeFilters.category.length +
    activeFilters.fabric.length +
    activeFilters.priceRange.length +
    (activeFilters.sort !== "newest" ? 1 : 0);

  return (
    <div className="space-y-6 select-none">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search collections, fabrics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-zinc-900/50 focus:outline-none focus:border-primary text-sm transition-all duration-300 font-body placeholder-neutral-400 dark:placeholder-neutral-600"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Filter Drawer Toggle & Sorting Dropdown */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 bg-white dark:bg-zinc-950 text-sm font-heading font-medium tracking-wide uppercase transition-all duration-300 hover-glow active-press cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-glow">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Quick Sort Select wrapper */}
          <div className="relative">
            <select
              value={activeFilters.sort}
              onChange={(e) => updateUrl({ sort: e.target.value })}
              className="appearance-none pl-5 pr-10 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-primary bg-white dark:bg-zinc-950 text-sm font-heading font-medium tracking-wide uppercase transition-all duration-300 cursor-pointer"
              aria-label="Sort products"
            >
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
              <svg className="h-4 w-4 fill-current text-neutral-500" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 dark:border-neutral-900 pt-4 animate-fade-in">
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mr-2">
            Active:
          </span>

          {/* Category badges */}
          {activeFilters.category.map((catSlug) => {
            const catName = categories.find((c) => c.slug === catSlug)?.name || catSlug;
            return (
              <span
                key={catSlug}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-xs font-body text-neutral-700 dark:text-neutral-300"
              >
                <span>Category: {catName}</span>
                <button
                  onClick={() => handleRemoveFilter("category", catSlug)}
                  className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label={`Remove category filter ${catName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Fabric badges */}
          {activeFilters.fabric.map((fabric) => (
            <span
              key={fabric}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-xs font-body text-neutral-700 dark:text-neutral-300"
            >
              <span>Fabric: {fabric}</span>
              <button
                onClick={() => handleRemoveFilter("fabric", fabric)}
                className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label={`Remove fabric filter ${fabric}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Price Range badges */}
          {activeFilters.priceRange.map((range) => {
            const rangeLabel = priceRangeLabels[range] || range;
            return (
              <span
                key={range}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 text-xs font-body text-neutral-700 dark:text-neutral-300"
              >
                <span>Price: {rangeLabel}</span>
                <button
                  onClick={() => handleRemoveFilter("priceRange", range)}
                  className="p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label={`Remove price range filter ${rangeLabel}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Clear All button */}
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-heading font-medium tracking-wider uppercase text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}

      {/* Product count indicator */}
      <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-body border-t border-neutral-100 dark:border-neutral-900 pt-4">
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
          priceRange: activeFilters.priceRange,
          sort: activeFilters.sort,
        }}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
