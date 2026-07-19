"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, RotateCcw, X } from "lucide-react";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/lib/services/products";

interface CategoryCollectionPageProps {
  categoryName: string;
  categorySlug: string;
  tagline: string;
  description: string;
  heroImage: string;
  products: Product[];
}

export default function CategoryCollectionPage({
  categoryName,
  tagline,
  description,
  heroImage,
  products,
}: CategoryCollectionPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterNewArrivals, setFilterNewArrivals] = useState(false);

  // Filter products client-side for zero latency and no page reloads
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Text search on name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }

      // 2. Featured filter
      if (filterFeatured && !product.featured) return false;

      // 3. New Arrivals filter
      if (filterNewArrivals && !product.newArrival) return false;

      return true;
    });
  }, [products, searchQuery, filterFeatured, filterNewArrivals]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterFeatured(false);
    setFilterNewArrivals(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-ivory text-charcoal">
      <Header />

      <main className="flex-grow w-full">
        {/* Luxury Editorial Collection Hero Banner */}
        <section className="relative h-[45vh] min-h-[350px] w-full flex items-center justify-center overflow-hidden bg-rich-charcoal">
          {/* Background Image */}
          <div className="absolute inset-0 select-none">
            <Image
              src={heroImage}
              alt={categoryName}
              fill
              priority
              className="object-cover object-center opacity-45 brightness-75 scale-100 transition-transform duration-[10s] ease-out hover:scale-105"
            />
            {/* Elegant Radial Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-rich-charcoal/10 via-rich-charcoal/50 to-rich-charcoal/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-rich-charcoal/70 via-transparent to-rich-charcoal/70" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center select-none space-y-6">
            <span className="text-xs uppercase tracking-[0.4em] text-[#B29567] font-heading font-semibold block">
              {tagline}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-light tracking-[0.2em] text-warm-ivory uppercase leading-tight">
              {categoryName}
            </h1>
            <div className="w-16 h-[1px] bg-antique-gold mx-auto my-4" />
            <p className="text-sm sm:text-base text-warm-cream/90 font-body leading-relaxed max-w-2xl mx-auto font-light">
              {description}
            </p>
          </div>
        </section>

        {/* Catalog Control Capsule & Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          {/* Sticky Filtering & Search Capsule */}
          <div className="w-full max-w-4xl mx-auto mb-16 p-2 bg-[#FDF9F3] border border-[#EADFCF] rounded-full shadow-luxury flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs md:max-w-md pl-4">
              <input
                type="text"
                placeholder="Search by design number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-transparent focus:outline-none text-sm font-body text-premium-brown placeholder-premium-brown/40 border-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-antique-gold" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-premium-brown/60 hover:text-royal-maroon transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters Toggles */}
            <div className="flex items-center gap-4 pr-4 shrink-0">
              {/* Featured Toggle */}
              <button
                onClick={() => setFilterFeatured(!filterFeatured)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterFeatured
                    ? "bg-royal-maroon text-warm-ivory"
                    : "bg-transparent text-royal-maroon hover:bg-royal-maroon/5 border border-royal-maroon/15"
                }`}
              >
                Featured
              </button>

              {/* New Arrivals Toggle */}
              <button
                onClick={() => setFilterNewArrivals(!filterNewArrivals)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterNewArrivals
                    ? "bg-royal-maroon text-warm-ivory"
                    : "bg-transparent text-royal-maroon hover:bg-royal-maroon/5 border border-royal-maroon/15"
                }`}
              >
                New Arrivals
              </button>

              {(filterFeatured || filterNewArrivals || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="p-1.5 text-premium-brown/60 hover:text-royal-maroon transition-colors cursor-pointer"
                  title="Clear All Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Product Count */}
          <div className="flex items-center justify-between text-xs text-premium-brown/65 font-body border-b border-antique-gold/10 pb-4 mb-8">
            <span>Showing {filteredProducts.length} of {products.length} designs</span>
          </div>

          {/* Grid Layout (exactly 4 desktop, 3 tablet, 2 mobile) */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8 lg:gap-10">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-pearl-white border border-antique-gold/15 max-w-xl mx-auto rounded-[20px] shadow-luxury animate-fade-in">
              <SlidersHorizontal className="w-8 h-8 text-royal-maroon mx-auto mb-4" />
              <h3 className="text-lg font-heading font-semibold text-deep-maroon uppercase tracking-wider mb-2">
                No Designs Match
              </h3>
              <p className="text-sm text-premium-brown/85 font-body leading-relaxed mb-6 font-light">
                No designs match your filter criteria in this collection.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-royal-maroon hover:bg-wine-red text-warm-ivory text-xs font-heading font-semibold tracking-wider uppercase transition-colors duration-300"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
