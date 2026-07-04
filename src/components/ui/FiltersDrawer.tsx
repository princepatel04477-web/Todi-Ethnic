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
    sort: string;
    featured?: boolean;
    newArrival?: boolean;
  };
  onApply: (filters: {
    category: string[];
    fabric: string[];
    sort: string;
    featured?: boolean;
    newArrival?: boolean;
  }) => void;
}

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
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState<boolean>(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevActiveFilters, setPrevActiveFilters] = useState(activeFilters);

  if (isOpen !== prevIsOpen || activeFilters !== prevActiveFilters) {
    setPrevIsOpen(isOpen);
    setPrevActiveFilters(activeFilters);
    if (isOpen) {
      setSelectedCategories(activeFilters.category);
      setSelectedFabrics(activeFilters.fabric);
      setSelectedSort(activeFilters.sort || "newest");
      setShowFeaturedOnly(!!activeFilters.featured);
      setShowNewArrivalsOnly(!!activeFilters.newArrival);
    }
  }

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedFabrics([]);
    setSelectedSort("newest");
    setShowFeaturedOnly(false);
    setShowNewArrivalsOnly(false);
  };

  const handleApply = () => {
    onApply({
      category: selectedCategories,
      fabric: selectedFabrics,
      sort: selectedSort,
      featured: showFeaturedOnly ? true : undefined,
      newArrival: showNewArrivalsOnly ? true : undefined,
    });
    onClose();
  };

  // Determine if any filters are active locally to show/hide reset in UI
  const hasChanges =
    selectedCategories.length > 0 ||
    selectedFabrics.length > 0 ||
    selectedSort !== "newest" ||
    showFeaturedOnly ||
    showNewArrivalsOnly;

  const localFiltersCount = 
    selectedCategories.length + 
    selectedFabrics.length + 
    (selectedSort !== "newest" ? 1 : 0) +
    (showFeaturedOnly ? 1 : 0) +
    (showNewArrivalsOnly ? 1 : 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-rich-charcoal/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 max-w-md w-full bg-warm-ivory border-l border-antique-gold/15 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-antique-gold/10">
          <div className="flex items-center gap-2">
            <h2 id="filters-drawer-title" className="text-lg font-heading font-semibold text-deep-maroon uppercase tracking-wider">
              Filters
            </h2>
            {hasChanges && (
              <span className="flex h-5 w-5 items-center justify-center bg-royal-maroon text-[9px] font-bold text-warm-ivory">
                {localFiltersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-heading font-medium tracking-wider text-premium-brown/60 hover:text-royal-maroon transition-colors cursor-pointer uppercase hover-underline"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-premium-brown/70 hover:text-royal-maroon transition-colors cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter options (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
          {/* Collection Status Filters */}
          <div className="space-y-4">
            <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-royal-maroon">
              Status Filters
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className="sr-only"
                />
                <div
                  className={`w-4.5 h-4.5 rounded-none border flex items-center justify-center transition-all ${
                    showFeaturedOnly
                      ? "border-royal-maroon bg-royal-maroon text-warm-ivory"
                      : "border-antique-gold/30 bg-transparent group-hover:border-royal-maroon/50"
                  }`}
                >
                  {showFeaturedOnly && (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-body text-premium-brown group-hover:text-royal-maroon transition-colors">
                  Featured Designs Only
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showNewArrivalsOnly}
                  onChange={() => setShowNewArrivalsOnly(!showNewArrivalsOnly)}
                  className="sr-only"
                />
                <div
                  className={`w-4.5 h-4.5 rounded-none border flex items-center justify-center transition-all ${
                    showNewArrivalsOnly
                      ? "border-royal-maroon bg-royal-maroon text-warm-ivory"
                      : "border-antique-gold/30 bg-transparent group-hover:border-royal-maroon/50"
                  }`}
                >
                  {showNewArrivalsOnly && (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-body text-premium-brown group-hover:text-royal-maroon transition-colors">
                  New Arrivals Only
                </span>
              </label>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-4 border-t border-antique-gold/10 pt-6">
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-royal-maroon">
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
                        className={`w-4.5 h-4.5 rounded-none border flex items-center justify-center transition-all ${
                          isChecked
                            ? "border-royal-maroon bg-royal-maroon text-warm-ivory"
                            : "border-antique-gold/30 bg-transparent group-hover:border-royal-maroon/50"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3.5 h-3.5 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-body text-premium-brown group-hover:text-royal-maroon transition-colors">
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
            <div className="space-y-4 border-t border-antique-gold/10 pt-6">
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-royal-maroon">
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
                        className={`w-4.5 h-4.5 rounded-none border flex items-center justify-center transition-all ${
                          isChecked
                            ? "border-royal-maroon bg-royal-maroon text-warm-ivory"
                            : "border-antique-gold/30 bg-transparent group-hover:border-royal-maroon/50"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3.5 h-3.5 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-body text-premium-brown group-hover:text-royal-maroon transition-colors">
                        {fabric}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-antique-gold/10 bg-pearl-white">
          <button
            onClick={handleApply}
            className="w-full py-4 bg-royal-maroon hover:bg-wine-red text-warm-ivory rounded-none font-heading font-semibold uppercase tracking-wider text-xs transition-all duration-300 hover-lift cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
