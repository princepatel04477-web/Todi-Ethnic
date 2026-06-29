"use client";

import React, { useEffect, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { Category } from "@/lib/services/products";

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  fabrics: string[];
  activeFilters: {
    category: string[];
    fabric: string[];
    priceRange: string[];
    sort: string;
  };
  onApply: (filters: {
    category: string[];
    fabric: string[];
    priceRange: string[];
    sort: string;
  }) => void;
}

const staticPriceRanges = [
  { label: "Under ₹5,000", value: "0-5000" },
  { label: "₹5,000 - ₹10,000", value: "5000-10000" },
  { label: "₹10,000 - ₹15,000", value: "10000-15000" },
  { label: "₹15,000 - ₹20,000", value: "15000-20000" },
  { label: "₹20,000 & Above", value: "20000+" },
];

const sortOptions = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export default function FiltersDrawer({
  isOpen,
  onClose,
  categories,
  fabrics,
  activeFilters,
  onApply,
}: FiltersDrawerProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevActiveFilters, setPrevActiveFilters] = useState(activeFilters);

  if (isOpen !== prevIsOpen || activeFilters !== prevActiveFilters) {
    setPrevIsOpen(isOpen);
    setPrevActiveFilters(activeFilters);
    if (isOpen) {
      setSelectedCategories(activeFilters.category);
      setSelectedFabrics(activeFilters.fabric);
      setSelectedPriceRanges(activeFilters.priceRange);
      setSelectedSort(activeFilters.sort || "newest");
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleToggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const handleToggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const handleTogglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedFabrics([]);
    setSelectedPriceRanges([]);
    setSelectedSort("newest");
  };

  const handleApply = () => {
    onApply({
      category: selectedCategories,
      fabric: selectedFabrics,
      priceRange: selectedPriceRanges,
      sort: selectedSort,
    });
    onClose();
  };

  // Determine if any filters are active locally to show/hide reset in UI
  const hasChanges =
    selectedCategories.length > 0 ||
    selectedFabrics.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedSort !== "newest";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 max-w-md w-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Filters
            </h2>
            {hasChanges && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {(selectedCategories.length + selectedFabrics.length + selectedPriceRanges.length + (selectedSort !== "newest" ? 1 : 0))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-heading font-medium tracking-wider text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary transition-colors cursor-pointer uppercase"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter options (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
          {/* Sort By */}
          <div className="space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-primary">
              Sort By
            </h3>
            <div className="space-y-3">
              {sortOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={selectedSort === option.value}
                    onChange={() => setSelectedSort(option.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      selectedSort === option.value
                        ? "border-primary bg-primary"
                        : "border-neutral-300 dark:border-neutral-700 bg-transparent group-hover:border-primary/50"
                    }`}
                  >
                    {selectedSort === option.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-body text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-6">
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-primary">
                Categories
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category) => {
                  const isChecked = selectedCategories.includes(category.slug);
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCategory(category.slug)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? "border-primary bg-primary text-white"
                            : "border-neutral-300 dark:border-neutral-700 bg-transparent group-hover:border-primary/50"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-body text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                        {category.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fabric Type */}
          {fabrics.length > 0 && (
            <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-6">
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-primary">
                Fabric Type
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {fabrics.map((fabric) => {
                  const isChecked = selectedFabrics.includes(fabric);
                  return (
                    <label
                      key={fabric}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleFabric(fabric)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? "border-primary bg-primary text-white"
                            : "border-neutral-300 dark:border-neutral-700 bg-transparent group-hover:border-primary/50"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-body text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                        {fabric}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-900 pt-6">
            <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-primary">
              Price Range
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {staticPriceRanges.map((range) => {
                const isChecked = selectedPriceRanges.includes(range.value);
                return (
                  <label
                    key={range.value}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePriceRange(range.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                        isChecked
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-300 dark:border-neutral-700 bg-transparent group-hover:border-primary/50"
                        }`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3 h-3 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-body text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {range.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-zinc-900/50">
          <button
            onClick={handleApply}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 active-press hover-glow cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
